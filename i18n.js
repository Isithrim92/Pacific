(function(){
  var LANGS = ['it', 'en', 'uk'];
  var LANG_NAMES = { it: 'Italiano', en: 'English', uk: 'Українська' };
  var STORAGE_KEY = 'vb-lang';

  function getStoredLang(){
    try{
      var v = localStorage.getItem(STORAGE_KEY);
      if(LANGS.indexOf(v) !== -1) return v;
    }catch(e){}
    return 'it';
  }

  function setStoredLang(lang){
    try{ localStorage.setItem(STORAGE_KEY, lang); }catch(e){}
  }

  window.__vbLang = getStoredLang();

  function applyTranslations(lang){
    var dict = (window.I18N && window.I18N[lang]) || {};

    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      if(dict[key] !== undefined) el.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function(el){
      var key = el.getAttribute('data-i18n-html');
      if(dict[key] !== undefined) el.innerHTML = dict[key];
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(function(el){
      el.getAttribute('data-i18n-attr').split(';').forEach(function(pair){
        var parts = pair.split(':');
        var attr = parts[0], key = parts[1];
        if(attr && key && dict[key] !== undefined) el.setAttribute(attr, dict[key]);
      });
    });

    document.documentElement.setAttribute('lang', lang);

    var labelEl = document.getElementById('langCurrentLabel');
    if(labelEl) labelEl.textContent = LANG_NAMES[lang] || lang;

    document.querySelectorAll('.lang-option').forEach(function(opt){
      var isActive = opt.getAttribute('data-lang') === lang;
      opt.classList.toggle('active', isActive);
      opt.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function revealPage(){
    document.documentElement.classList.remove('i18n-pending');
  }

  function initLangSwitch(){
    var btn = document.getElementById('langSwitchBtn');
    var menu = document.getElementById('langMenu');
    if(!btn || !menu) return;

    function closeMenu(){
      menu.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', 'false');
    }
    function openMenu(){
      menu.removeAttribute('hidden');
      btn.setAttribute('aria-expanded', 'true');
    }

    btn.addEventListener('click', function(e){
      e.stopPropagation();
      if(menu.hasAttribute('hidden')) openMenu(); else closeMenu();
    });
    document.addEventListener('click', function(){ closeMenu(); });
    menu.addEventListener('click', function(e){ e.stopPropagation(); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closeMenu();
    });

    menu.querySelectorAll('.lang-option').forEach(function(opt){
      opt.addEventListener('click', function(){
        var lang = opt.getAttribute('data-lang');
        if(LANGS.indexOf(lang) === -1) return;
        setStoredLang(lang);
        window.__vbLang = lang;
        applyTranslations(lang);
        closeMenu();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    try{
      applyTranslations(window.__vbLang);
      initLangSwitch();
    }catch(e){
      if(window.console) console.error('i18n error', e);
    }
    revealPage();
  });

  // Safety net: never leave the page permanently hidden if something above fails.
  setTimeout(revealPage, 2000);
})();
