import { resolveComponent, openBlock, createBlock, withCtx, createElementBlock, Fragment, renderList, createVNode, createTextVNode, toDisplayString, createCommentVNode, ref, watch, createElementVNode, Transition, withDirectives, vModelText } from 'vue';
import { useApi } from '@directus/extensions-sdk';

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
    },
  },
  data() {
    return {
      groupedPages: [],
    };
  },
  watch: {
    pages(newVal) {
      this.groupPages(newVal);
    },
  },
  methods: {
    groupPages(pages) {
      this.groupedPages = pages.reduce((groups, page) => {
        const group = groups.find((g) => g.name === page.group);
        if (group) {
          group.items.push(page);
        } else {
          groups.push({ name: page.group, items: [page]});
        }
        return groups;
      }, []);
    },
  },
  created() {
    this.groupPages(this.pages);
  },
};

function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_v_list_item_title = resolveComponent("v-list-item-title");
  const _component_v_list_item = resolveComponent("v-list-item");
  const _component_v_text_overflow = resolveComponent("v-text-overflow");
  const _component_v_list_item_content = resolveComponent("v-list-item-content");
  const _component_v_list_group = resolveComponent("v-list-group");
  const _component_v_list = resolveComponent("v-list");

  return ($props.pages)
    ? (openBlock(), createBlock(_component_v_list, {
        key: 0,
        nav: ""
      }, {
        default: withCtx(() => [
          (openBlock(true), createElementBlock(Fragment, null, renderList($data.groupedPages, (group) => {
            return (openBlock(), createBlock(_component_v_list_group, {
              title: group.name
            }, {
              activator: withCtx(() => [
                createVNode(_component_v_list_item, { header: "" }, {
                  default: withCtx(() => [
                    createVNode(_component_v_list_item_title, null, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(group.name), 1 /* TEXT */)
                      ]),
                      _: 2 /* DYNAMIC */
                    }, 1024 /* DYNAMIC_SLOTS */)
                  ]),
                  _: 2 /* DYNAMIC */
                }, 1024 /* DYNAMIC_SLOTS */)
              ]),
              default: withCtx(() => [
                (openBlock(true), createElementBlock(Fragment, null, renderList(group.items, (navItem) => {
                  return (openBlock(), createBlock(_component_v_list_item, {
                    key: navItem.to,
                    active: navItem.uri === $props.current,
                    to: navItem.to
                  }, {
                    default: withCtx(() => [
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
              _: 2 /* DYNAMIC */
            }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["title"]))
          }), 256 /* UNKEYED_FRAGMENT */))
        ]),
        _: 1 /* STABLE */
      }))
    : createCommentVNode("v-if", true)
}
var PageNavigation = /*#__PURE__*/_export_sfc(_sfc_main$1, [['render',_sfc_render$1],['__file',"navigation.vue"]]);

var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

var css = "\n.page-body[data-v-1edfedca] {\n    padding: 20px;\n    background-color: var(--theme--background);\n    border-radius: 8px;\n    margin-bottom: 20px;\n}\n.form-group[data-v-1edfedca] {\n    margin-bottom: 15px;\n\tpadding: 10px;\n}\n.form-group label[data-v-1edfedca] {\n    display: block;\n    margin-bottom: 5px;\n    font-weight: var(--v-button-font-weight, 600);\n}\n.form-control[data-v-1edfedca] {\n    width: 100%;\n    padding: 10px;\n    border: var(--theme--border-width) solid var(--v-list-item-border-color, var(--theme--form--field--input--border-color));\n    border-radius: var(--theme--border-radius);\n\tbackground-color: var(--theme--background);\n}\n.btn[data-v-1edfedca] {\n\t\n\n    display: inline-block;\n    padding: 10px 20px;\n    font-size: var(--v-button-font-size, 16px);\n    font-weight: var(--v-button-font-weight, 600);\n    text-align: center;\n    cursor: pointer;\n    border-radius: 4px;\n\tbackground-color: var(--theme--primary);\n\tcolor: var(--foreground-inverted);\n    border: none;\n\tmargin: 10px;\n}\n.btn[data-v-1edfedca]:hover {\n    background-color: var(--theme--primary-accent);\n}\n.btn-debug[data-v-1edfedca] {\n\tfloat: right;\n}\n.wrapped-pre[data-v-1edfedca] {\n    white-space: pre-wrap;\n    word-wrap: break-word;\n    overflow-wrap: break-word;\n    max-width: 100%;\n    background-color: #0d1117;\n    padding: 10px;\n    border-radius: 4px;\n    margin-top: 20px;\n}\n.pre-container[data-v-1edfedca] {\n\tmargin-left: 10px;\n\tmargin-right: 10px;\n\tborder: var(--theme--border-width) solid var(--v-list-item-border-color, var(--theme--form--field--input--border-color));\n\tborder-radius: var(--theme--border-radius);\n    position: relative;\n\tmargin-bottom: 20px;\n}\n.btn-copy[data-v-1edfedca] {\n    position: absolute;\n    right: 0px;\n    background-color: #21262e;\n    color: white;\n    border: none;\n    padding: 5px 10px;\n    border-radius: 4px;\n    cursor: pointer;\n}\n.btn-copy[data-v-1edfedca]:hover {\n    background-color: #30363d;\n}\n.copied-popup[data-v-1edfedca] {\n  position: fixed;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  background-color: var(--theme--primary);\n  color: var(--foreground-inverted);\n  font-size: var(--v-button-font-size, 16px);\n  font-weight: var(--v-button-font-weight, 600);\n  padding: 10px 20px;\n  border-radius: var(--theme--border-radius);\n  z-index: 9999;\n}\n.fade-enter-active[data-v-1edfedca],\n.fade-leave-active[data-v-1edfedca] {\n  transition: opacity 0.3s ease-in-out;\n}\n.fade-enter-from[data-v-1edfedca],\n.fade-leave-to[data-v-1edfedca] {\n  opacity: 0;\n}\n";
n(css,{});

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
			console.log("Before");
			showCopiedPopup.value = true;
			setTimeout(() => {
				showCopiedPopup.value = false;
				console.log(showCopiedPopup.value);
			}, 1500); 
			console.log("after" + showCopiedPopup.value);
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
const _hoisted_1 = {
  key: 0,
  class: "copied-popup"
};
const _hoisted_2 = ["innerHTML"];
const _hoisted_3 = ["for"];
const _hoisted_4 = ["onUpdate:modelValue", "id"];
const _hoisted_5 = {
  key: 4,
  class: "pre-container"
};
const _hoisted_6 = { class: "wrapped-pre" };

function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_page_navigation = resolveComponent("page-navigation");
  const _component_router_view = resolveComponent("router-view");
  const _component_v_icon = resolveComponent("v-icon");
  const _component_private_view = resolveComponent("private-view");

  return (openBlock(), createBlock(_component_private_view, { title: $setup.page_title }, {
    navigation: withCtx(() => [
      createVNode(_component_page_navigation, {
        current: $props.page,
        pages: $setup.all_pages
      }, null, 8 /* PROPS */, ["current", "pages"])
    ]),
    default: withCtx(() => [
      createElementVNode("div", null, [
        createVNode(Transition, { name: "fade" }, {
          default: withCtx(() => [
            ($setup.showCopiedPopup)
              ? (openBlock(), createElementBlock("div", _hoisted_1, "Copied!"))
              : createCommentVNode("v-if", true)
          ]),
          _: 1 /* STABLE */
        })
      ]),
      createVNode(_component_router_view, {
        name: "tools-module",
        page: $props.page
      }, null, 8 /* PROPS */, ["page"]),
      ($setup.page_body)
        ? (openBlock(), createElementBlock("div", {
            key: 0,
            innerHTML: $setup.page_body,
            class: "page-body"
          }, null, 8 /* PROPS */, _hoisted_2))
        : createCommentVNode("v-if", true),
      (openBlock(true), createElementBlock(Fragment, null, renderList($setup.optionsSet, (origin) => {
        return (openBlock(), createElementBlock("div", {
          key: origin,
          class: "form-group"
        }, [
          createElementVNode("label", { for: origin }, toDisplayString(origin), 9 /* TEXT, PROPS */, _hoisted_3),
          withDirectives(createElementVNode("textarea", {
            "onUpdate:modelValue": $event => (($setup.formData[origin]) = $event),
            id: origin,
            class: "form-control"
          }, null, 8 /* PROPS */, _hoisted_4), [
            [vModelText, $setup.formData[origin]]
          ])
        ]))
      }), 128 /* KEYED_FRAGMENT */)),
      (!$options.isHomePage)
        ? (openBlock(), createElementBlock("button", {
            key: 1,
            onClick: _cache[0] || (_cache[0] = (...args) => ($setup.submitForm && $setup.submitForm(...args))),
            class: "btn btn-primary"
          }, "Submit"))
        : createCommentVNode("v-if", true),
      (!$options.isHomePage)
        ? (openBlock(), createElementBlock("button", {
            key: 2,
            onClick: _cache[1] || (_cache[1] = (...args) => ($setup.showInNewTab && $setup.showInNewTab(...args))),
            class: "btn btn-new-tab"
          }, "Show In New Tab"))
        : createCommentVNode("v-if", true),
      (!$options.isHomePage)
        ? (openBlock(), createElementBlock("button", {
            key: 3,
            onClick: _cache[2] || (_cache[2] = (...args) => ($setup.debugButton && $setup.debugButton(...args))),
            class: "btn btn-debug"
          }, "Debug"))
        : createCommentVNode("v-if", true),
      ($options.showJsonRsp)
        ? (openBlock(), createElementBlock("div", _hoisted_5, [
            createElementVNode("button", {
              onClick: _cache[3] || (_cache[3] = (...args) => ($setup.copyToClipboard && $setup.copyToClipboard(...args))),
              class: "btn btn-copy"
            }, [
              createVNode(_component_v_icon, { name: "content_copy" })
            ]),
            createElementVNode("pre", _hoisted_6, toDisplayString($setup.rspJsonStr), 1 /* TEXT */)
          ]))
        : createCommentVNode("v-if", true)
    ]),
    _: 1 /* STABLE */
  }, 8 /* PROPS */, ["title"]))
}
var ModuleComponent = /*#__PURE__*/_export_sfc(_sfc_main, [['render',_sfc_render],['__scopeId',"data-v-1edfedca"],['__file',"module.vue"]]);

var index = {
	id: 'tools-module',
	name: 'Tools',
	icon: 'build',
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
