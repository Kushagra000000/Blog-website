//useful to print appropriate header/footer for the page.
function isActiveRoute(route, currentRoute) {
  return route === currentRoute ? 'active' : '';
}

module.exports = { isActiveRoute };