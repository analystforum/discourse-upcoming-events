class UpcomingEventsController < ApplicationController
  def index
    events = UpcomingEvents.new.call(params[:parent_category])
    render json: { events: events }
  end
end
