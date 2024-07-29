<template>
	<private-view :title="page_title">
		<template v-if="breadcrumb" #headline>
			<v-breadcrumb :items="breadcrumb" />
		</template>
		<template #navigation>
			<page-navigation :current="page" :pages="all_pages" />
		</template>
		<router-view name="tools-module" :page="page" />
		<div v-if="page_body" v-html="page_body"></div>

		<div v-for="origin in testSet" :key="origin">
			<textarea v-model="formData[origin]" :placeholder="origin"></textarea>
		</div>
		
		<button @click="submitForm">Submit</button>
	</private-view>
</template>

<script>
import { ref, watch } from 'vue';
import { useApi } from '@directus/extensions-sdk';
import { useRouter } from 'vue-router';
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
	setup(props) {
		const router = useRouter();
		const api = useApi();
		const page_title = ref('');
		const page_body = ref('');
		const form_fields = ref({});
		const formData = ref({});
		let testSet = new Set();
		const breadcrumb = ref([
			{
				name: 'Home',
				to: `/tools-module`,
			},
		]);
		const all_pages = ref([]);
		
		render_page(props.page);
		fetch_all_pages();
		
		watch(
			() => props.page,
			async () => {
				render_page(props.page);
				console.log(testSet);
			}
		);

		return { page_title, page_body, breadcrumb, all_pages, form_fields, formData, testSet, submitForm, };

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
					if (i == keys.length - 1) {
						form_fields.value[keys[i]] = obj[keys[i]];
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
			form_fields.value = {};
			formData.value = {};
			testSet.clear();


			api.get(`/items/api_parents?fields=*,api.*&filter[title][_eq]=${page}`).then((rsp) => {
				if (rsp.data.data) {
					rsp.data.data.forEach(item => {
						page_title.value = item.title;
						page_body.value = item.description;
						recursiveFind(rsp.data.data[0]);
						// const placeholders = parse_placeholders(item.main);
						// if (placeholders.length) {
						// 	form_fields.value['main'] = placeholders;
						// 	placeholders.forEach(field => {
						// 		if (!formData.value[field]) {
						// 			formData.value[field] = '';
						// 		}
						// 	});
						// }
					});
				} else {
					page_title.value = "404: Not Found";
				}
			}).catch((error) => {
				console.log(error);
			});
		}

		function fetch_all_pages() {
			api.get('/items/api_parents?fields=title,color').then((rsp) => {
				all_pages.value = [];
				rsp.data.data.forEach(item => {
					all_pages.value.push({
						label: item.title,
						to: `/tools-module/${item.title}`,
						color: item.color,
						icon: 'upload',
					});
				});
			}).catch((error) => {
				console.log(error);
			});
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
			console.log(formData.value);
		}
	},
};
</script>