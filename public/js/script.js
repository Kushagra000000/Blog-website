document.addEventListener('DOMContentLoaded', function () {
  const allButtons = document.querySelectorAll('.searchBtn');
  const searchBar  = document.querySelector('.search-bar');
  const searchInput = document.getElementById('searchInput');
  const searchClose = document.getElementById('searchClose');

  allButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      if (!searchBar) return;
      searchBar.classList.add('open');
      this.setAttribute('aria-expanded', 'true');
      if (searchInput) searchInput.focus();
    });
  });

  if (searchClose) {
    searchClose.addEventListener('click', function () {
      if (!searchBar) return;
      searchBar.classList.remove('open');
    });
  }
});