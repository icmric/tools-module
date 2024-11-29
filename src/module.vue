<template>
    <!-- Main view container -->
    <private-view :title="page_title">
        <!-- Navigation sidebar -->
        <template #navigation>
            <page-navigation :current="page" :pages="all_pages" />
        </template>
        <!-- External link icon for non-home pages -->
        <template #title-outer:append v-if="!isHomePage">
            <v-icon name="open_in_new" @click="openResource" />
        </template>

        <!-- Copied notification popup -->
        <div>
            <transition name="fade">
                <div v-if="showCopiedPopup" class="copied-popup">Copied!</div>
            </transition>
        </div>

        <!-- Router view for tools module -->
        <router-view name="tools-module" :page="page" />
        <!-- Page description/body -->
        <div v-if="page_body" v-html="page_body" class="page-body"></div>

        <div v-for="(formGroup, groupIndex) in formData" :key="groupIndex" class="form-group-container">
            <!-- group headder for each linked resource -->
            <h3 v-if="groupIndex > 0">Additional Resource {{ groupIndex }}: {{ formHeadings[groupIndex] }}</h3>

            <!-- Form fields for this group -->
            <div v-if="optionsSet[groupIndex]" class="form-group">
                <div v-for="option in Array.from(optionsSet[groupIndex])" :key="option" class="form-field">
                    <label :for="`${groupIndex}-${option}`">{{ option }}</label>
                    <textarea v-model="formData[groupIndex][option]" :id="`${groupIndex}-${option}`"
                        class="form-control">
            </textarea>
                </div>
            </div>
        </div>

        <!-- Action buttons -->
        <button v-if="!isHomePage" @click="submitForm" class="btn btn-primary">Submit</button>
        <button v-if="!isHomePage" @click="showInNewTab" class="btn btn-new-tab">Show In New Tab</button>
        <button v-if="!isHomePage" @click="debugButton" class="btn btn-debug">Debug</button>

        <!-- JSON response display -->
        <div v-if="showJsonRsp" class="pre-container">
            <button @click="copyToClipboard" class="btn btn-copy"><v-icon name="content_copy" /></button>
            <pre class="wrapped-pre">{{ rspJsonStr }}</pre>
        </div>
    </private-view>
</template>

<script>
import { ref, watch } from 'vue';
import { useApi } from '@directus/extensions-sdk';
import PageNavigation from './components/navigation.vue';

export default {
    components: {
        PageNavigation,
    },
    props: {
        page: {
            type: String,
            default: 'home',
        },
    },
    computed: {
        isHomePage() {
            return this.$props.page === 'home';
        },
        showJsonRsp() {
            return this.rspJsonStr !== "";
        },
    },
    setup(props) {
        const api = useApi();
        // State management using refs
        const all_pages = ref([]);
        const page_title = ref('');
        const page_body = ref('');
        const formData = ref([]);
        const searchParams = new URLSearchParams(window.location.search);
        const rspJsonStr = ref("");
        const showCopiedPopup = ref(false);
        const optionsSet = ref([new Set([])]);
        const formHeadings = ref([]);
        const prevResponses = ref([]);

        // Internal state variables
        let pageID = "";
        let rawRequest = "";
        let rawPageName = "";
        let bypassTransform = false;
        let formattedApiQuerys = [];

        render_page(props.page);
        fetch_all_pages();

        watch(
            () => props.page,
            async () => {
                render_page(props.page);
            }
        );

        return { page_title, page_body, all_pages, formData, optionsSet, rspJsonStr, showCopiedPopup, formHeadings, submitForm, debugButton, showInNewTab, copyToClipboard, openResource, };

        // Recursively find form fields in the data structure
        function recursiveFind(obj, prepend = "", index = 0, ignoredKeys = ["other_resources"]) {
            if (!formData.value[index]) {
                formData.value[index] = {};
            }
            if (!optionsSet.value[index]) {
                optionsSet.value[index] = new Set([]);
            }

            let keys = Object.keys(obj);
            for (let i = 0; i < keys.length; i++) {
                // Skip the key if it's in the ignoredKeys list
                if (ignoredKeys.includes(keys[i])) {
                    continue;
                }
                if (obj[keys[i]] != null && typeof obj[keys[i]] == "object") {
                    recursiveFind(obj[keys[i]], prepend, index);
                } else {
                    let parseResult = parse_placeholders(obj[keys[i]]);
                    if (parseResult != null && allowUserInput(parseResult[0])) {
                        optionsSet.value[index].add(`${prepend}${parseResult[0]}`);
                        formData.value[index][prepend + parseResult[0]] == null ? formData.value[index][prepend + parseResult[0]] = parseResult[1] : null;
                    }
                }
            }
        }

        function allowUserInput(objToCheck) {
            let valuesToCheck = ["reqAccountability", "$tool", "prevApiRsp", "apiResponse"];
            for (let i = 0; i < valuesToCheck.length; i++) {
                if (objToCheck.includes(valuesToCheck[i])) {
                    return false;
                }
            }
            return true;
        }

        // Render page content and setup form
        async function render_page(page) {
            clearValues()
            if (page === 'home') {
                page_title.value = 'Tools';
                page_body.value = 'Please select a tool on the left to get started!';
            } else {
                try {
                    const rsp = await api.get(`/items/resources?fields=*,retrieves.*,other_resources.*.*.*&filter[title][_eq]=${page}`);
                    if (rsp.data.data) {
                        rsp.data.data.forEach(item => {
                            rawPageName = item.title;
                            page_title.value = transformTitle(item.title);
                            page_body.value = item.description;
                            rawRequest = item.main;
                            recursiveFind(rsp.data.data[0], "", 0);
                            pageID = item.id;

                            // Handle linked resources
                            item.other_resources.forEach((resource, index) => {
                                optionsSet.value[index + 1] = new Set([]);
                                formData.value[index + 1] = {};
                                formHeadings.value[index + 1] = resource.item.title;
                                recursiveFind(resource.item, '', index + 1);
                            });

                            // Handle URL parameters
                            searchParams.forEach((value, key) => {
                                if (optionsSet.value[0].has(key)) {
                                    formData.value[0][key] = value;
                                }
                            });
                        });
                    }
                } catch (error) {
                    console.error(error);
                    page_title.value = "404: Not Found";
                }
            }
        }

        function fetch_all_pages() {
            // This and openResource are done dodgily, resources is hard coded
            // works for now, will need to be updated to be dynamic when making renders
            // Create invisible field in each item which has the name of the group (resources, renders, etc)??
            api.get('/items/resources?fields=*,displayGroup.*').then((rsp) => {
                all_pages.value = [];
                rsp.data.data.forEach(item => {
                    let group = item.displayGroup;
                    if (group == null) {
                        group = "Misc";
                    }

                    all_pages.value.push({
                        label: transformTitle(item.title),
                        to: `/tools-module/${item.title}`,
                        group: group,
                        ID: item.id,
                    });
                });
            }).catch((error) => {
                console.log(error);
            });
        }

        function transformTitle(title) {
            title = title.replace(/-/g, ' ');
            return title.charAt(0).toUpperCase() + title.slice(1);
        }

        function parse_placeholders(text) {
            const regex = /{(.*?)}/g; // Non-greedy match
            let match;
            const placeholders = [];
            while ((match = regex.exec(text)) !== null) {
                let parts = match[1].split(' ');
                let path = parts[0];
                placeholders.push(path);
                placeholders.push(parts.slice(1).join(' '));
            }
            if (placeholders.length <= 0) {
                return null;
            } else {
                return placeholders;
            }
        }

        function clearValues() {
            // Reset form state
            formData.value = [{}];
            optionsSet.value = [new Set([])];
            rspJsonStr.value = "";
            rawPageName = "";
            prevResponses.value = [];
        }

        async function manageApiRequests() {
            // Reset previous responses so they dont stack up if multiple requests are made without refreshing the page
            prevResponses.value = [];
            // This makes it so the final chained resource is shown as the final response and the others are in order in previous responses
            // Not entirley sure how to fix, maybe add a check to see if there are multiple requests, and if so start from the seccond one and itterate through
            // then come back and do the first one? 
            for (const group in formData.value) {
                var index = parseInt(group);
                var apiHeading = formHeadings.value[index] || rawPageName;
                await makeApiRequest(formData.value[index], index == formData.value.length - 1, apiHeading);
            };
        }

        async function makeApiRequest(apiReqBody, finalReq, apiHeading) {
            // I dont think this is actually used anywhere???
            for (const term in apiReqBody) {
                const groupNum = term.at(0);
                if (formattedApiQuerys[groupNum] == null) {
                    formattedApiQuerys[groupNum] = [];
                }
                formattedApiQuerys[groupNum].push(term.slice(1));
            }
            let finalPrevRsp;
            if (finalReq) {
                finalPrevRsp = prevResponses.value;
            }
            let postReqData = {
                "tool": apiHeading,
                "body": apiReqBody,
                "bypassTransform": bypassTransform,
                "prevApiRsp": finalPrevRsp,
            };

            await api.post(buildApiUrl(false, apiReqBody.title), postReqData).then((rsp) => {
                let jsonRsp = rsp.data;
                if (finalReq) {
                    rspJsonStr.value = jsonRsp;
                }
                prevResponses.value.push(jsonRsp);
            }).catch((error) => {
                console.log(error);
            });
        }

        function submitForm() {
            rspJsonStr.value = "...";
            manageApiRequests(true);
        }

        async function debugButton() {
            rspJsonStr.value = "...";
            bypassTransform = true;
            await makeApiRequest();
            rspJsonStr.value = JSON.stringify(rspJsonStr.value, null, 2);
            rspJsonStr.value += "\nForm Data: " + JSON.stringify(formData.value, null, 2);
            rspJsonStr.value += "\nAPI URL: " + buildApiUrl();
            rspJsonStr.value += "\nRaw Request: " + rawRequest;
        }

        async function copyToClipboard() {
            // pretty print copied text? if no, remove ,null, 2
            navigator.clipboard.writeText(JSON.stringify(rspJsonStr.value, null, 2));
            showCopiedPopup.value = true;
            setTimeout(() => {
                showCopiedPopup.value = false;
            }, 1500);
        }

        async function showInNewTab() {
            await manageApiRequests();

            // Create a new window
            const newWindow = window.open('', '_blank');

            // Ensure the new window is not null (in case of popup blockers)
            if (newWindow) {
                // Use JSON.stringify with formatting for readability
                const formattedJson = JSON.stringify(rspJsonStr.value, null, 2);

                // Write a formatted HTML page to display the JSON
                newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>JSON Response</title>
                <style>
                    body { 
                        font-family: monospace; 
                        white-space: pre; 
                        background-color: #f4f4f4;
                        padding: 20px;
                    }
                </style>
            </head>
            <body>${formattedJson}</body>
            </html>
        `);
            } else {
                // Handle popup blocker
                alert('Popup blocked. Please allow popups for this site.');
            }
        }

        function buildApiUrl(getRequest = false, pageName) {
            let urlDestination = pageName || rawPageName;
            let url = '/tools/' + urlDestination;

            if (getRequest) {
                // only used for GET requests
                if (Object.keys(formData.value).length > 0) {
                    url += '?';
                    Object.keys(formData.value).forEach((key, index) => {
                        url += `${key}=${formData.value[key]}`;
                        if (index < Object.keys(formData.value).length - 1) {
                            url += '&';
                        }
                    });
                }
            }

            // .replace only used when making GET request from here
            return url.replace("$request.", "");
        }

        function openResource() {

            try {
                window.open("/admin/content/resources/" + pageID);
            } catch (error) {
                rspJsonStr.value = "Error opening resource";
            }
        }
    },
};
</script>

<style scoped>
.page-body {
    padding: 20px;
    background-color: var(--theme--background);
    border-radius: 8px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
    padding: 10px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: var(--v-button-font-weight, 600);
}

.form-control {
    width: 100%;
    padding: 10px;
    border: var(--theme--border-width) solid var(--v-list-item-border-color, var(--theme--form--field--input--border-color));
    border-radius: var(--theme--border-radius);
    background-color: var(--theme--background);
}

.btn {


    display: inline-block;
    padding: 10px 20px;
    font-size: var(--v-button-font-size, 16px);
    font-weight: var(--v-button-font-weight, 600);
    text-align: center;
    cursor: pointer;
    border-radius: 4px;
    background-color: var(--theme--primary);
    color: var(--foreground-inverted);
    border: none;
    margin: 10px;
}

.btn:hover {
    background-color: var(--theme--primary-accent);
}

.btn-debug {
    float: right;
}

.wrapped-pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
    background-color: #0d1117;
    padding: 10px;
    border-radius: 4px;
    margin-top: 20px;
}

.pre-container {
    margin-left: 10px;
    margin-right: 10px;
    border: var(--theme--border-width) solid var(--v-list-item-border-color, var(--theme--form--field--input--border-color));
    border-radius: var(--theme--border-radius);
    position: relative;
    margin-bottom: 20px;
}

.btn-copy {
    position: absolute;
    right: 0px;
    background-color: #21262e;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
}

.btn-copy:hover {
    background-color: #30363d;
}

.copied-popup {
    position: fixed;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--theme--primary);
    color: var(--foreground-inverted);
    font-size: var(--v-button-font-size, 16px);
    font-weight: var(--v-button-font-weight, 600);
    padding: 10px 20px;
    border-radius: var(--theme--border-radius);
    z-index: 9999;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>