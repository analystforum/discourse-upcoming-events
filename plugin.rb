# name: discourse-upcoming-events
# about: Displays upcoming and featured events.
# version: 0.4
# authors: David Newkerk
# dependencies: discourse-events, discourse-layouts

enabled_site_setting :upcoming_events_enabled

register_asset "stylesheets/events-widget.scss"

after_initialize do
  load File.expand_path("../app/topic_query_upcoming_events.rb", __FILE__)
  load File.expand_path("../app/upcoming_events.rb", __FILE__)
  load File.expand_path("../app/controllers/upcoming_events_controller.rb", __FILE__)

  Discourse::Application.routes.append do
    get "/upcoming-events" => "upcoming_events#index"
  end
end

DiscourseEvent.on(:layouts_ready) do
  DiscourseLayouts::Widget.add("events-widget", position: "right", order: "start")
end
