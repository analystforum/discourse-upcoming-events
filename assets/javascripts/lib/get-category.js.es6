const getParentCategoryId = function() {
  const container = Discourse.__container__;
  const path = window.location.pathname;
  let controller;

  if (/^\/c\//.test(path)) {
    // Listings
    controller = container.lookup("controller:navigation/category");
  } else if (/^\/t\//.test(path)) {
    // Topics
    controller = container.lookup("controller:topic");
  } else {
    // No category
    return null;
  }

  const category = controller.get("category");
  if (category) {
    return category.parent_category_id ? category.parent_category_id : category.id;
  } else {
    return null;
  }
}

export { getParentCategoryId }
