import { resolveComponent, openBlock, createBlock, withCtx, createElementBlock, Fragment, renderList, createVNode, createCommentVNode, ref, watch, createSlots, createElementVNode, toDisplayString, withDirectives, vModelText } from 'vue';
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

const _hoisted_1 = ["innerHTML"];
const _hoisted_2 = { key: 1 };
const _hoisted_3 = ["onUpdate:modelValue", "placeholder"];

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
      (Object.keys($setup.form_fields).length)
        ? (openBlock(), createElementBlock("div", _hoisted_2, [
            (openBlock(true), createElementBlock(Fragment, null, renderList($setup.form_fields, (fields, origin) => {
              return (openBlock(), createElementBlock("div", { key: origin }, [
                createElementVNode("h3", null, toDisplayString(origin), 1 /* TEXT */),
                (openBlock(true), createElementBlock(Fragment, null, renderList(fields, (field) => {
                  return (openBlock(), createElementBlock("div", { key: field }, [
                    withDirectives(createElementVNode("input", {
                      "onUpdate:modelValue": $event => (($setup.formData[field]) = $event),
                      placeholder: field
                    }, null, 8 /* PROPS */, _hoisted_3), [
                      [vModelText, $setup.formData[field]]
                    ])
                  ]))
                }), 128 /* KEYED_FRAGMENT */))
              ]))
            }), 128 /* KEYED_FRAGMENT */))
          ]))
        : createCommentVNode("v-if", true),
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
