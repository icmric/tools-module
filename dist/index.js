import { resolveComponent, openBlock, createBlock, withCtx, createElementBlock, Fragment, renderList, createVNode, createCommentVNode, ref, watch, createSlots, withDirectives, createElementVNode, vModelText } from 'vue';
import { useApi } from '@directus/extensions-sdk';
import { useRouter } from 'vue-router';

var _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

const _sfc_main$1 = {
	name: 'PageNavigation',
	inheritAttrs: false,
	props: {
		current: {
			type: String,
			default: null,
		},
		pages: {
			type: Array,
			default: [],
		}
	},
};

function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_v_icon = resolveComponent("v-icon");
  const _component_v_list_item_icon = resolveComponent("v-list-item-icon");
  const _component_v_text_overflow = resolveComponent("v-text-overflow");
  const _component_v_list_item_content = resolveComponent("v-list-item-content");
  const _component_v_list_item = resolveComponent("v-list-item");
  const _component_v_list = resolveComponent("v-list");

  return ($props.pages)
    ? (openBlock(), createBlock(_component_v_list, {
        key: 0,
        nav: ""
      }, {
        default: withCtx(() => [
          (openBlock(true), createElementBlock(Fragment, null, renderList($props.pages, (navItem) => {
            return (openBlock(), createBlock(_component_v_list_item, {
              key: navItem.to,
              active: navItem.uri == $props.current,
              to: navItem.to
            }, {
              default: withCtx(() => [
                createVNode(_component_v_list_item_icon, null, {
                  default: withCtx(() => [
                    createVNode(_component_v_icon, {
                      name: navItem.icon,
                      color: navItem.color
                    }, null, 8 /* PROPS */, ["name", "color"])
                  ]),
                  _: 2 /* DYNAMIC */
                }, 1024 /* DYNAMIC_SLOTS */),
                createVNode(_component_v_list_item_content, null, {
                  default: withCtx(() => [
                    createVNode(_component_v_text_overflow, {
                      text: navItem.label
                    }, null, 8 /* PROPS */, ["text"])
                  ]),
                  _: 2 /* DYNAMIC */
                }, 1024 /* DYNAMIC_SLOTS */)
              ]),
              _: 2 /* DYNAMIC */
            }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["active", "to"]))
          }), 128 /* KEYED_FRAGMENT */))
        ]),
        _: 1 /* STABLE */
      }))
    : createCommentVNode("v-if", true)
}
var PageNavigation = /*#__PURE__*/_export_sfc(_sfc_main$1, [['render',_sfc_render$1],['__file',"navigation.vue"]]);

const _sfc_main = {
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
		useRouter();
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

const _hoisted_1 = ["innerHTML"];
const _hoisted_2 = ["onUpdate:modelValue", "placeholder"];

function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_v_breadcrumb = resolveComponent("v-breadcrumb");
  const _component_page_navigation = resolveComponent("page-navigation");
  const _component_router_view = resolveComponent("router-view");
  const _component_private_view = resolveComponent("private-view");

  return (openBlock(), createBlock(_component_private_view, { title: $setup.page_title }, createSlots({
    navigation: withCtx(() => [
      createVNode(_component_page_navigation, {
        current: $props.page,
        pages: $setup.all_pages
      }, null, 8 /* PROPS */, ["current", "pages"])
    ]),
    default: withCtx(() => [
      createVNode(_component_router_view, {
        name: "tools-module",
        page: $props.page
      }, null, 8 /* PROPS */, ["page"]),
      ($setup.page_body)
        ? (openBlock(), createElementBlock("div", {
            key: 0,
            innerHTML: $setup.page_body
          }, null, 8 /* PROPS */, _hoisted_1))
        : createCommentVNode("v-if", true),
      (openBlock(true), createElementBlock(Fragment, null, renderList($setup.testSet, (origin) => {
        return (openBlock(), createElementBlock("div", { key: origin }, [
          withDirectives(createElementVNode("textarea", {
            "onUpdate:modelValue": $event => (($setup.formData[origin]) = $event),
            placeholder: origin
          }, null, 8 /* PROPS */, _hoisted_2), [
            [vModelText, $setup.formData[origin]]
          ])
        ]))
      }), 128 /* KEYED_FRAGMENT */)),
      createElementVNode("button", {
        onClick: _cache[0] || (_cache[0] = (...args) => ($setup.submitForm && $setup.submitForm(...args)))
      }, "Submit")
    ]),
    _: 2 /* DYNAMIC */
  }, [
    ($setup.breadcrumb)
      ? {
          name: "headline",
          fn: withCtx(() => [
            createVNode(_component_v_breadcrumb, { items: $setup.breadcrumb }, null, 8 /* PROPS */, ["items"])
          ]),
          key: "0"
        }
      : undefined
  ]), 1032 /* PROPS, DYNAMIC_SLOTS */, ["title"]))
}
var ModuleComponent = /*#__PURE__*/_export_sfc(_sfc_main, [['render',_sfc_render],['__file',"module.vue"]]);

var index = {
	id: 'tools-module',
	name: 'Tools',
	icon: 'box',
	routes: [
		{
			path: '',
			props: true,
			component: ModuleComponent,
		},
		{
			name: 'page',
			path: ':page',
			props: true,
			component: ModuleComponent,
		},
	],
};

export { index as default };
