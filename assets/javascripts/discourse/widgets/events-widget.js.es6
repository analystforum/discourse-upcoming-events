// See examples of widgets with async data:
// app/assets/javascripts/discourse/widgets/quick-access-panel.js.es6
// plugins/poll/assets/javascripts/widgets/discourse-poll.js.es6
import { createWidget } from "discourse/widgets/widget";
import { h } from "virtual-dom";
import { ajax } from "discourse/lib/ajax";
import { getParentCategoryId } from "../../lib/get-category";

export default createWidget("events-widget", {
  tagName: "div.events-widget.widget-container.no-border",
  buildKey: () => "events-widget",

  defaultState() {
    return {
      loading: false,
      loaded: false,
      events: null,
    };
  },

  init() {
    this.appEvents.off("page:changed", this, "_fetchDataThrottled");
    this.appEvents.on("page:changed", this, "_fetchDataThrottled");
  },

  _fetchDataThrottled: _.throttle(function() {
    this._fetchData();
  }, 2000, { "trailing": false }),

  _fetchData() {
    const { state } = this;
    if (state.loading) { return; }
    state.loading = true;
    state.events = null;
    const categoryId = getParentCategoryId();
    ajax("/upcoming-events", { data: { parent_category: categoryId } })
      .then((response) => {
        state.events = response.events;
        state.loaded = true;
        this.scheduleRerender();
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        state.loading = false;
      });
  },

  _createEvents(events) {
    return events.map((event) => {
      return h("div.event.border-box",
        [
          h("div.date",
            [
              h("span.month", moment(event.date).format("MMM")),
              h("span.day", moment(event.date).format("DD")),
            ]
          ),
          h("a.title", { href: Discourse.getURL(`/t/${event.slug}/${event.id}`) }, event.title)
        ]
      );
    });
  },

  html(attrs, state) {
    const result = [];
    if (state.loaded) {
      // Featured Events
      if (state.events && !_.isEmpty(state.events.featured)) {
        result.push(
          h("div.events",
            [
              h("h2", I18n.t("upcoming_events.featured_heading")),
              this._createEvents(state.events.featured)
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
              this._createEvents(state.events.upcoming)
            ]
          )
        );
      }
    }
    return result;
  }
});
