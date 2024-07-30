<template>
	<v-list nav v-if="pages" >
	  <v-list-group v-for="group in groupedPages" :title="group.name">
		<template v-slot:activator>
			<v-list-item header>
			  <v-list-item-title>{{ group.name }}</v-list-item-title>
			  <v-btn icon @click="toggleGroup(group.name)" >
				<v-icon v-if="group.isOpen">keyboard_arrow_up</v-icon>
				<v-icon v-else>keyboard_arrow_down</v-icon>
			</v-btn>
			</v-list-item>
		  </template>
		<v-list-item v-for="navItem in group.items" :key="navItem.to" :active="navItem.uri === current" :to="navItem.to">
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
          groups.push({ name: page.group, items: [page], isOpen: true });
        }
        return groups;
      }, []);
    },
    toggleGroup(groupName) {
      this.groupedPages.find((group) => group.name === groupName).isOpen = !this.groupedPages.find(
        (group) => group.name === groupName
      ).isOpen;
    },
  },
  created() {
    this.groupPages(this.pages);
  },
};

/*
<template>
	<div>
	  <v-list nav>
		<v-list-group v-for="(group, groupName) in groupedPages" :key="groupName">
		  <template v-slot:activator>
			<v-list-item header>
			  <v-list-item-title>test</v-list-item-title>
			  <v-list-item-icon>
				<v-icon v-if="group.isOpen">mdi-chevron-down</v-icon>
				<v-icon v-else>mdi-chevron-right</v-icon>
			  </v-list-item-icon>
			</v-list-item>
		  </template>
		  <v-list-item v-for="navItem in group.items" :key="navItem.label">
			<v-list-item-content>
			  <v-text-overflow :text="navItem.label" />
			</v-list-item-content>
		  </v-list-item>
		</v-list-group>
	  </v-list>
	</div>
</template>

<template>
  <v-list nav v-if="pages" >
    <v-list-group v-for="group in groupedPages" :title="group.name">
		<template #header>
        <v-list-item-content>
          <v-btn icon @click="toggleGroup(group.name)" >
            <v-icon v-if="group.isOpen">keyboard_arrow_up</v-icon>
            <v-icon v-else>keyboard_arrow_down</v-icon>
          </v-btn>
        </v-list-item-content>
      </template>
      <v-list-item v-for="navItem in group.items" :key="navItem.to" :active="navItem.uri === current" :to="navItem.to">
        <v-list-item-content>
          <v-text-overflow :text="navItem.label" />
        </v-list-item-content>
      </v-list-item>
    </v-list-group>
  </v-list>
</template>
*/
</script>
