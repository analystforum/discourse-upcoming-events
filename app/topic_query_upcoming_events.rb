# Add an upcoming_events method to TopicQuery class.
# Based on list_agenda and list_calendar in Events plugin.rb.
# Main purpose is to set remove_past regardless of SiteSetting.events_remove_past_*
require_dependency 'topic_query'
class ::TopicQuery
  def upcoming_events
    @options[:unordered] = true
    @options[:list] = 'agenda'

    opts = {
      remove_past: true,
    }

    opts[:status] = 'open' if SiteSetting.events_agenda_filter_closed

    create_list(:agenda, {}, event_results(opts))
  end
end
