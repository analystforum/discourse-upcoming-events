// See examples of widgets with async data:
// app/assets/javascripts/discourse/widgets/quick-access-panel.js.es6
// plugins/poll/assets/javascripts/widgets/discourse-poll.js.es6
import { createWidget } from "discourse/widgets/widget";
import { h } from "virtual-dom";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default createWidget("events-widget", {
  tagName: "div.events-widget.widget-container.no-border",
  buildKey: () => "events-widget",

  init() {
    // Re-render when a category change is detected.
    // this.appEvents.on("category:changed", this, "_categoryChanged");

    // Using page:changed instead.
    // Topic pages do not get the category:changed event on full page reloads.
    // Note: if widget is rendered by Custom Layouts, browsing to a topic resets to defaultState.
    this.appEvents.off("page:changed", this);
    this.appEvents.on("page:changed", this, () => {
      // console.log("events-widget page:changed", this.state.categoryId, Discourse.currentCategory);
      this.state.previousCategoryId = this.state.categoryId;
      this.state.categoryId = Discourse.currentCategory;
      // console.log("previousCategoryId:", this.state.previousCategoryId, "categoryId:", this.state.categoryId);
      if (this.state.previousCategoryId === this.state.categoryId) {
        return;
      } else {
        this.fetchData();
      }
    });
  },

  // _categoryChanged(id) {
  //   console.log("_categoryChanged", id);
  //   const { state } = this;
  //   state.categoryId = id;
  //   this.fetchData();
  // },

  defaultState() {
    return {
      loading: false,
      loaded: false,
      events: null,
      categoryId: undefined,
      previousCategoryId: undefined,
    };
  },

  fetchData() {
    const { state } = this;
    if (state.loading) { return; }
    state.loading = true;
    state.events = null;
    ajax("/upcoming-events", { data: { parent_category: state.categoryId } })
      .then((response) => {
        state.events = response.events;
        state.loaded = true;
        this.scheduleRerender();
      })
      .catch(popupAjaxError)
      .finally(() => {
        state.loading = false;
      });    
  },

  createEvents(events) {
    return events.map((event) => {
      return h("div.event.border-box",
        [
          h("div.date",
            [
              h("span.month", moment(event.date).format("MMM")),
              h("span.day", moment(event.date).format("DD")),
            ]
          ),
          h("a.title", { href: `/t/${event.slug}/${event.id}` }, event.title)
        ]
      );
    });
  },

  html(attrs, state) {
    const result = [];
    if (state.loading) {
      result.push(h("div.spinner-container", h("div.spinner")));
    } else if (state.loaded) {
      // Featured Events
      if (state.events && !_.isEmpty(state.events.featured)) {
        result.push(
          h("div.events",
            [
              h("h2", I18n.t("upcoming_events.featured_heading")),
              this.createEvents(state.events.featured)
            ]
          )
        );
      }
      // Upcoming Events
      if (state.events && !_.isEmpty(state.events.upcoming)) {
        result.push(
          h("div.events",
            [
              h("h2", I18n.t("upcoming_events.upcoming_heading")),
              this.createEvents(state.events.upcoming)
            ]
          )
        );
      }
    }
    return result;
  }
});
