class UpcomingEvents
  def call(category)
    @category = category
    list_opts = {}
    list_opts[:category] = events_category
    topic_list = TopicQuery.new(nil, list_opts).upcoming_events

    events = {
      featured: [],
      upcoming: []
    }
    topic_list.topics.each do |topic|
      event = {
        id: topic[:id],
        slug: topic[:slug],
        title: topic[:title],
        date: topic.event[:start]
      }
      if is_featured(event[:id])
        events[:featured] << event
      else
        events[:upcoming] << event
      end
    end

    {
      featured: (events[:featured].any? ? [ events[:featured].first ] : []),
      upcoming: (events[:upcoming].any? ? events[:upcoming].first(SiteSetting.upcoming_events_limit) : [])
    }
  end

  private

  def events_category
    return SiteSetting.analystforum_settings_default_events_category if @category.blank?
    if SiteSetting.analystforum_settings_cfa_categories.split('|').include? @category
      SiteSetting.analystforum_settings_cfa_events_category
    elsif SiteSetting.analystforum_settings_caia_categories.split('|').include? @category
      SiteSetting.analystforum_settings_caia_events_category
    elsif SiteSetting.analystforum_settings_frm_categories.split('|').include? @category
      SiteSetting.analystforum_settings_frm_events_category
    else
      SiteSetting.analystforum_settings_default_events_category
    end
  end

  def is_featured(id)
    featured_event_ids.include?(id.to_s) ? true : false
  end

  def featured_event_ids
    SiteSetting.upcoming_events_featured_cfa.split('|') |
    SiteSetting.upcoming_events_featured_caia.split('|') |
    SiteSetting.upcoming_events_featured_frm.split('|')
  end
end
