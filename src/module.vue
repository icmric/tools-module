<template>
    <private-view :title="page_title">
        <template #navigation>
            <page-navigation :current="page" :pages="all_pages" />
        </template>
		<div>
			<transition name="fade">
				<div v-if="showCopiedPopup" class="copied-popup">Copied!</div>
			</transition>
		</div>
        <router-view name="tools-module" :page="page" />
        <div v-if="page_body" v-html="page_body" class="page-body"></div>

        <div v-for="origin in optionsSet" :key="origin" class="form-group">
            <label :for="origin">{{ origin }}</label>
            <textarea v-model="formData[origin]" :id="origin" class="form-control"></textarea>
        </div>
        
        <button v-if="!isHomePage" @click="submitForm" class="btn btn-primary">Submit</button>

		<button v-if="!isHomePage" @click="showInNewTab" class="btn btn-new-tab">Show In New Tab</button>

		<button v-if="!isHomePage" @click="debugButton" class="btn btn-debug">Debug</button>

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
		const all_pages = ref([]);
		const page_title = ref('');
		const page_body = ref('');
		const formData = ref({});
		let rawRequest = "";
		let optionsSet = new Set();
		let rspJsonStr = ref("");
		let rawPageName = "";
		let bypassTransform = false;
		let showCopiedPopup = ref(false);
		
		render_page(props.page);
		fetch_all_pages();
		
		watch(
			() => props.page,
			async () => {
				render_page(props.page);
			}
		);

		return { page_title, page_body, all_pages, formData, optionsSet, rspJsonStr, showCopiedPopup, submitForm, debugButton, showInNewTab, copyToClipboard, };

		function recursiveFind(obj) {
			let keys = Object.keys(obj);
			for (let i = 0; i < keys.length; i++) {
				if (obj[keys[i]] != null && typeof obj[keys[i]] == "object") {
					recursiveFind(obj[keys[i]]);	
				} else {
					let parseResult = parse_placeholders(obj[keys[i]]);
					if (parseResult != null) {
						if (allowUserInput(parseResult[0])) {
							optionsSet.add(parseResult[0]);
							formData.value[parseResult[0]] == null ? formData.value[parseResult[0]] = parseResult[1] : null;
						}
					}
				}
			}
		}

		function allowUserInput(objToCheck) {
			let valuesToCheck = ["reqAccountability", "$tool", "apiResponse"];
			for (let i = 0; i < valuesToCheck.length; i++) {
				if (objToCheck.includes(valuesToCheck[i])) {
					return false;
				}
			}
			return true;
		}

		async function render_page(page) {
			// Reset form fields and form data
			formData.value = {};
			optionsSet.clear();
			rspJsonStr.value = "";
			rawPageName = "";

			if (page === 'home') {
				page_title.value = 'Tools';
				page_body.value = 'Please select a tool on the left to get started!';
			} else {
				api.get(`/items/resources?fields=*,retrieves.*&filter[title][_eq]=${page}`).then((rsp) => {
					if (rsp.data.data) {
						rsp.data.data.forEach(item => {
							rawPageName = item.title;
							page_title.value = transformTitle(item.title);
							page_body.value = item.description;
							rawRequest = item.main;
							recursiveFind(rsp.data.data[0]);
						});
					} else {
						page_title.value = "404: Not Found";
					}
				}).catch((error) => {
					console.log(error);
				});
			}
		}

		function fetch_all_pages() {
			api.get('/items/resources?fields=*').then((rsp) => {
				all_pages.value = [];
				rsp.data.data.forEach(item => {
					console.log(item);
					let group = item.displayGroup;
					if (group == null) {
						group = "Misc";
					}

					all_pages.value.push({
						label: transformTitle(item.title),
						to: `/tools-module/${item.title}`,
						group: group,
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

		async function makeApiRequest() {
			let postReqData = {
				"tool": rawPageName,
				"body": formData.value,
				"bypassTransform": bypassTransform,
			};
			
			await api.post(buildApiUrl(), postReqData).then((rsp) => {
				let jsonRsp = rsp.data;
				rspJsonStr.value = jsonRsp;
			}).catch((error) => {
				console.log(error);
			});
		}

		function submitForm() {
			rspJsonStr.value = "...";
			makeApiRequest();
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
			window.open(buildApiUrl(true));
		}

		function buildApiUrl(getRequest = false) {
			let url = '/tools/' + rawPageName;

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