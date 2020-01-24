class UpcomingEvents
  def call(category)
    @category = category
    @default_category = SiteSetting.analystforum_settings_default_events_category
    @cfa_events_category = SiteSetting.analystforum_settings_cfa_events_category
    @caia_events_category = SiteSetting.analystforum_settings_caia_events_category
    @frm_events_category = SiteSetting.analystforum_settings_frm_events_category
    @cfa_categories = SiteSetting.analystforum_settings_cfa_categories.split("|")
    @caia_categories = SiteSetting.analystforum_settings_caia_categories.split("|")
    @frm_categories = SiteSetting.analystforum_settings_frm_categories.split("|")
    @featured_event_ids ||= featured_event_ids
    list_opts = {}
    list_opts[:category] = events_category
    topic_list = TopicQuery.new(nil, list_opts).upcoming_events
    events = { featured: [], upcoming: [] }

    topic_list.topics.each do |topic|
      event = {
        id: topic[:id],
        slug: topic[:slug],
        title: topic[:title],
        date: topic.event[:start]
      }
      is_featured?(event[:id]) ? events[:featured] << event : events[:upcoming] << event
    end

    {
      featured: (events[:featured].any? ? [ events[:featured].first ] : []),
      upcoming: (events[:upcoming].any? ? events[:upcoming].first(SiteSetting.upcoming_events_limit) : [])
    }
  end

  private

  def events_category
    return @default_category if @category.blank?
    if @cfa_categories.include? @category || @cfa_events_category == @category
      @cfa_events_category
    elsif @caia_categories.include? @category || @caia_events_category == @category
      @caia_events_category
    elsif @frm_categories.include? @category || @frm_events_category == @category
      @frm_events_category
    else
      @default_category
    end
  end

  def featured_event_ids
    Tag.find_by(name: "featured-events").topics.ids
  end

  def is_featured?(id)
    @featured_event_ids.include?(id) ? true : false
  end
end
