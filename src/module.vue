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

		<div v-if="Object.keys(form_fields).length">
			<div v-for="(fields, origin) in form_fields" :key="origin">
				<h3>{{ origin }}</h3>
				<div v-for="field in fields" :key="field">
					<input v-model="formData[field]" :placeholder="field" />
				</div>
			</div>
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
			() => {
				render_page(props.page);
			}
		);

		return { page_title, page_body, breadcrumb, all_pages, form_fields, formData, submitForm };

		function render_page(page) {
			// Reset form fields and form data
			form_fields.value = {};
			formData.value = {};

			api.get(`/items/api_parents?fields=title,description,main&filter[title][_eq]=${page}`).then((rsp) => {
				if (rsp.data.data) {
					rsp.data.data.forEach(item => {
						page_title.value = item.title;
						page_body.value = item.description;
						const placeholders = parse_placeholders(item.main);
						if (placeholders.length) {
							form_fields.value['main'] = placeholders;
							placeholders.forEach(field => {
								if (!formData.value[field]) {
									formData.value[field] = '';
								}
							});
						}
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
			console.log(placeholders);
			return placeholders;
		}

		function submitForm() {
			console.log(formData.value);
			// Handle form submission
		}
	},
};
</script>