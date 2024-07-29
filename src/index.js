import ModuleComponent from './module.vue';

export default {
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
