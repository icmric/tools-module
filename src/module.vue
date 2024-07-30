<template>
    <private-view :title="page_title">
        
        <template #navigation>
            <page-navigation :current="page" :pages="all_pages" />
        </template>

        <router-view name="tools-module" :page="page" />
        <div v-if="page_body" v-html="page_body" class="page-body"></div>

        <div v-for="origin in testSet" :key="origin" class="form-group">
            <label :for="origin">{{ origin }}</label>
            <textarea v-model="formData[origin]" :placeholder="origin" :id="origin" class="form-control"></textarea>
        </div>
        
        <button v-if="!isHomePage" @click="submitForm" class="btn btn-primary">Submit</button>

        <pre class="wrapped-pre">{{ rspJsonStr }}</pre>
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
		}
	},
	setup(props) {
		const api = useApi();
		const page_title = ref('');
		const page_body = ref('');
		const formData = ref({});
		let testSet = new Set();
		const breadcrumb = ref([
			{
				name: 'Home',
				to: `/tools-module`,
			},
		]);
		const all_pages = ref([]);
		let rspJsonStr = ref("");
		let rawPageName = "";
		
		render_page(props.page);
		fetch_all_pages();
		
		watch(
			() => props.page,
			async () => {
				render_page(props.page);
			}
		);

		return { page_title, page_body, breadcrumb, all_pages, formData, testSet, rspJsonStr, submitForm, };

		function recursiveFind(obj) {
			let keys = Object.keys(obj);
			for (let i = 0; i < keys.length; i++) {
				if (obj[keys[i]] != null && typeof obj[keys[i]] == "object") {
					//console.log("Recursing at " + obj[keys[i]]);
					recursiveFind(obj[keys[i]]);	
				} else {
					let parseResult = parse_placeholders(obj[keys[i]]);
					if (parseResult != null) {
						for (let j = 0; j < parseResult.length; j++) {
							if (recursiveFindIncludesCheck(parseResult[j]) == true) {
								//console.log(keys[i] + " " + parseResult[j]);
								testSet.add(parseResult[j]);
							}
						}
					}
				}
			}
		}

		function recursiveFindIncludesCheck(objToCheck) {
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
			testSet.clear();
			rspJsonStr.value = "";
			rawPageName = "";

			if (page === 'home') {
				page_title.value = 'Tools';
				page_body.value = 'Please select a tool on the left to get started!';
			} else {
				api.get(`/items/api_parents?fields=*,api.*&filter[title][_eq]=${page}`).then((rsp) => {
					if (rsp.data.data) {
						rsp.data.data.forEach(item => {
							rawPageName = item.title;
							page_title.value = transformTitle(item.title);
							page_body.value = item.description;
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
			api.get('/items/api_parents?fields=*,displayGroup.*').then((rsp) => {
				all_pages.value = [];
				rsp.data.data.forEach(item => {
					let group;
					try {
						group = item.displayGroup.group;
					} catch (error) {
						group = 'Misc';
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
				placeholders.push(match[1]);
			}
			if (placeholders.length <= 0) {
				return null;
			} else {
				return placeholders;
			}
		}

		function submitForm() {
			rspJsonStr.value = "...";
			let postReqData = {
				"tool": rawPageName,
				"body": formData.value,
			};
			api.post(buildApiUrl(), postReqData).then((rsp) => {
				let jsonRsp = rsp.data;
				rspJsonStr.value = jsonRsp;
			}).catch((error) => {
				console.log(error);
			});
		}

		function buildApiUrl() {
			let url = '/tools/' + rawPageName;
			/*
			// only used for GET requests
			if (Object.keys(formData.value).length > 0) {
				url += '?';
				Object.keys(formData.value).forEach((key, index) => {
					url += `${key}=${formData.value[key]}`;
					if (index < Object.keys(formData.value).length - 1) {
						url += '&';
					}
				});
			}*/
			// .replace only used when making GET request from here
			return url.replace("$url.", "");
		}
	},
};
</script>

<style scoped>
.page-body {
    padding: 20px;
    background-color: #0d1117;
    border-radius: 8px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.btn {
    display: inline-block;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    cursor: pointer;
    border-radius: 4px;
}

.btn-primary {
    background-color: #6644ff;
    color: white;
    border: none;
}

.btn-primary:hover {
    background-color: #5238c6;
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
</style>