var app = new Vue({
  el: "#app",
  data: {
    databaseName: "MyDatabase",
    tableName: "MyTable",
    inputCSV: "",
    queryObjects: [],
    message: "Hello, World!",
    messageShown: false
  },
  computed: {
    query: function() {
      let query = `CREATE TABLE \`${this.databaseName}\`.\`${
        this.tableName
      }\` (\n`;
      this.queryObjects.forEach(o => {
        let _column_name = o.COLUMN_NAME;
        let _data_type = o.DATA_TYPE;
        let _primary_key = o.DATA_TYPE === "YES" ? " PRIMARY KEY" : "";
        let _nullable = o.NULLABLE === "YES" ? "" : " NOT NULL";
        let _autoincrement = o.AUTOINCREMENT === "YES" ? " AUTO INCREMENT" : "";
        query += `\t${_column_name} ${_data_type}${_primary_key}${_nullable},\n`;
      });
      query = query.slice(0, -1);
      query += "\n)";
      return query;
    }
  },
  methods: {
    computeItems: function() {
      if (!this.inputCSV) {
        return;
      }
      let _queryObject = [];
      let _input = this.inputCSV;
      let _array = _input.split("\n");
      let _header = this.getCommaSeparatedValues(_array[0], ",");
      for (let i = 1; i < _array.length; i++) {
        let _row = this.getCommaSeparatedValues(_array[i], ",");
        let _object = {};
        for (let j = 0; j < _row.length; j++) {
          let _key = `${_header[j]}`;
          _object[_key] = _row[j];
        }
        _queryObject.push(_object);
      }

      this.queryObjects = _queryObject;
    },
    getCommaSeparatedValues: (row, separator) => {
      if (separator === ",") {
        return row
          .replace(/"/g, "")
          .replace(/ /g, "_")
          .split(separator);
      }
      return row.slice(1, -1).split(separator);
    },
    copyQuery: function() {
      var copyTextarea = document.querySelector(".ace_text-input");
      copyTextarea.focus();
      copyTextarea.select();
      if(document.execCommand("copy")){
        this.showMessage("SQL query copied to clipboard");
      } else {
        this.showMessage("Failed to perform clipboard operation");
      }

    },
    reset: function() {
      this.inputCSV = sampleCSV;
      this.showMessage("UI restored to default state");
    },
    dismissMessage: function() {
      this.messageShown = false;
    },
    showMessage: function(msg) {
      this.message = msg;
      this.messageShown = true;
    }
  },
  watch: {
    inputCSV: function(e) {
      this.computeItems();
    },
    queryObjects: function() {
      editor.setValue(this.query);
    },
    message: function() {
      app.messageShown = true;
    },
    messageShown: function() {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
      messageTimeout = setTimeout(function() {
        app.messageShown = false;
      }, 3000);
    }
  }
});

var messageTimeout;
var editor;
document.addEventListener("DOMContentLoaded", function(event) {
  app.inputCSV = sampleCSV;
  editor = ace.edit("editor");
  editor.setTheme("ace/theme/dracula");
  editor.session.setMode("ace/mode/sql");
});
