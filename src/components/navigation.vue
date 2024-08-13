<template>
	<v-list nav v-if="pages" >
		<v-list-group v-for="group in groupedPages" :title="group.name">
			<template v-slot:activator>
				<v-list-item header>
					<v-list-item-title>{{ group.name }}</v-list-item-title>
				</v-list-item>
			</template>
			<v-list-item v-for="navItem in group.items" :key="navItem.to" :active="navItem.uri === current" :to="navItem.to" >
				<v-list-item-content>
					<v-text-overflow :text="navItem.label" />
				</v-list-item-content>
			</v-list-item>
		</v-list-group>
	</v-list>
</template>

<script>
export default {
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
</script>