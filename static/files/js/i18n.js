/* globals app, window */

/*
 * Simple client-side i18n service.
 *
 * Language is auto-detected from the browser (navigator.languages), persisted
 * in localStorage under "tcLang" and toggleable from the footer. Every UI
 * string lives in the "t." dictionary with a friendly English fallback for
 * en. The "lang" filter translates a key: {{ "t.torrents" | lang }}. The raw
 * "t.xxx" placeholder text shown before Angular renders doubles as a
 * self-documenting key, and the en dictionary maps to the final English
 * strings.
 */
app.factory("i18n", ["storage", function(storage) {
  var LANGUAGE_KEY = "tcLang";
  var DEFAULT_LANG = "zh";
  var dicts = {
    zh: {
      "t.torrents": "种子",
      "t.torrent": "种子",
      "t.total": "共",
      "t.files": "文件",
      "t.file": "文件",
      "t.size": "大小",
      "t.loading": "加载中",
      "t.addtorrents": "在上方添加种子",
      "t.nofiles": "没有文件",
      "t.cancel": "取消",
      "t.remove": "移除",
      "t.stopping": "停止",
      "t.stop": "停止",
      "t.downloads": "下载",
      "t.downloadfiles": "在上方下载文件",
      "t.updated": "更新于",
      "t.connecting": "连接中…",
      "t.disconnected": "已断开连接",
      "t.error": "错误",
      "t.config": "配置",
      "t.save": "保存",
      "t.cancelshort": "撤销",
      "t.omnibar": "输入要搜索的关键词、磁力链接或种子 URL，也可以直接把种子文件拖到这里",
      "t.name": "名称",
      "t.infohash": "信息哈希",
      "t.trackers": "Tracker 服务器",
      "t.tracker": "Tracker",
      "t.magneteditor": "磁力链接编辑器",
      "t.starttorrent": "开始下载",
      "t.loadmagnet": "加载磁力",
      "t.loadtorrent": "加载种子",
      "t.edit": "编辑",
      "t.search": "搜索",
      "t.loadmore": "加载更多",
      "t.noresults": "没有结果",
      "t.noproviders": "没有配置任何搜索源",
      "t.invalidhash": "信息哈希无效",
      "t.uibug": "界面错误",
      "t.drophere": "把种子文件拖到这里",
      "t.invalidfile": "无效的文件事件",
      "t.notorrents": "没有可上传的种子文件",
      "t.noItemUrl": "没有找到项目 URL",
      "t.noResponse": "没有响应",
      "t.noMagnet": "没有找到磁力或信息哈希",
      "t.free": "剩余",
      "t.version": "版本",
      "t.usersconnected": "个用户已连接",
      "t.goroutines": "协程数",
      "t.gomem": "内存",
      "t.cpu": "CPU",
      "t.mem": "内存",
      "t.disk": "磁盘",
      "t.up": "在线",
      "t.language": "语言",
      "d.zh": "简体中文",
      "d.en": "English",
      "d.moment": "zh-cn"
    },
    en: {
      "t.torrents": "Torrents",
      "t.torrent": "torrent",
      "t.total": "",
      "t.files": "Files",
      "t.file": "File",
      "t.size": "Size",
      "t.loading": "Loading",
      "t.addtorrents": "Add torrents above",
      "t.nofiles": "No files",
      "t.cancel": "Cancel",
      "t.remove": "Remove",
      "t.stopping": "Stopping",
      "t.stop": "Stop",
      "t.downloads": "Downloads",
      "t.downloadfiles": "Download files above",
      "t.updated": "updated",
      "t.connecting": "Connecting",
      "t.disconnected": "Disconnected",
      "t.error": "Error",
      "t.config": "Configuration",
      "t.save": "Save",
      "t.cancelshort": "Cancel",
      "t.omnibar": "Enter search query, magnet URI, torrent URL or drop a torrent file here",
      "t.name": "Name",
      "t.infohash": "Info Hash",
      "t.trackers": "Trackers",
      "t.tracker": "Tracker",
      "t.magneteditor": "Magnet URI Editor",
      "t.starttorrent": "Start Torrent",
      "t.loadmagnet": "Load Magnet",
      "t.loadtorrent": "Load Torrent",
      "t.edit": "Edit",
      "t.search": "Search",
      "t.loadmore": "Load more",
      "t.noresults": "No results!",
      "t.noproviders": "You have no search providers",
      "t.invalidhash": "Invalid Info Hash",
      "t.uibug": "UI Bug",
      "t.drophere": "Drop torrent files here",
      "t.invalidfile": "Invalid file event",
      "t.notorrents": "No torrent files to upload",
      "t.noItemUrl": "No item URL found",
      "t.noResponse": "No response",
      "t.noMagnet": "No magnet or infohash found",
      "t.free": "free",
      "t.version": "version",
      "t.usersconnected": "users connected",
      "t.goroutines": "goroutines",
      "t.gomem": "gomem",
      "t.cpu": "cpu",
      "t.mem": "mem",
      "t.disk": "disk",
      "t.up": "up",
      "t.language": "Language",
      "d.zh": "简体中文",
      "d.en": "English",
      "d.moment": "en"
    }
  };

  var hasStorage = function() {
    try {
      return typeof window.localStorage !== "undefined";
    } catch (e) {
      return false;
    }
  };

  var detect = function() {
    var langs = window.navigator.languages || [window.navigator.language];
    for (var i = 0; i < langs.length; i++) {
      var l = (langs[i] || "").toLowerCase();
      if (l.indexOf("zh") === 0) return "zh";
      if (l.indexOf("en") === 0) return "en";
    }
    return DEFAULT_LANG;
  };

  var safeGet = function(lang) {
    return dicts[lang] || dicts.en;
  };

  var service = {
    language: DEFAULT_LANG,
    available: ["zh", "en"],

    load: function() {
      var lang = DEFAULT_LANG;
      if (hasStorage()) {
        var saved = window.localStorage.getItem(LANGUAGE_KEY);
        if (saved && dicts[saved]) lang = saved;
        else lang = detect();
      } else {
        lang = detect();
      }
      service.language = lang;
      service.applyMoment();
      return lang;
    },

    set: function(lang) {
      service.language = dicts[lang] ? lang : DEFAULT_LANG;
      if (hasStorage()) {
        try {
          window.localStorage.setItem(LANGUAGE_KEY, service.language);
        } catch (e) {}
      }
      service.applyMoment();
    },

    applyMoment: function() {
      try {
        window.moment.locale(safeGet(service.language)["d.moment"]);
      } catch (e) {}
    },

    langName: function(lang) {
      return safeGet(lang)["d." + lang] || lang;
    },

    t: function(key, params) {
      var d = safeGet(service.language);
      var s = d[key] !== undefined ? d[key] : key;
      if (params) {
        for (var k in params) {
          s = s.split("{{" + k + "}}").join(params[k]);
        }
      }
      return s;
    }
  };

  return service;
}]);

//translate a dictionary key: {{ "t.torrents" | lang }}
app.filter("lang", ["i18n", function(i18n) {
  return function(key) {
    return i18n.t(key);
  };
}]);

//load the language before anything renders and expose a tiny wrapper on
//$rootScope for templates ($rootScope.i18n.language is a plain property so
//ng-show/ng-if comparisons stay correct; switching re-creates the wrapper)
app.run(["$rootScope", "i18n", function($rootScope, i18n) {
  i18n.load();
  var expose = function() {
    return {
      language: i18n.language,
      available: function() {
        return i18n.available;
      },
      set: function(lang) {
        i18n.set(lang);
        $rootScope.i18n = expose();
        $rootScope.$applyAsync();
      },
      name: function(lang) {
        return i18n.langName(lang);
      }
    };
  };
  $rootScope.i18n = expose();
}]);