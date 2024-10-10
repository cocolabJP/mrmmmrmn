const $ = (id) => {
  return document.getElementById(id);
};

const Util = {
  getCurrentTime: () => {
    return new Date().getTime();
  },
  getDatetimeStr: (timestamp) => {
    var d = new Date(timestamp);
    return d.getFullYear()
            + '/' + ('0' + (d.getMonth() + 1)).slice(-2)
            + '/' + ('0' + d.getDate()).slice(-2)
            + ' ' + ('0' + d.getHours()).slice(-2)
            + ':' + ('0' + d.getMinutes()).slice(-2)
            + ':' + ('0' + d.getSeconds()).slice(-2);
  },
  getDateStr: (timestamp) => {
    var d = new Date(timestamp);
    return d.getFullYear()
            + '/' + ('0' + (d.getMonth() + 1)).slice(-2)
            + '/' + ('0' + d.getDate()).slice(-2)
            + ' (' + '日月火水木金土'[d.getDay()] + ')';
  },
  getTimeStr: (timestamp) => {
    var d = new Date(timestamp);
    return ('0' + d.getHours()).slice(-2)
            + ':' + ('0' + d.getMinutes()).slice(-2)
            + ':' + ('0' + d.getSeconds()).slice(-2);
  },
  getTimeago: (timestamp) => {
    var d = new Date(Util.getCurrentTime() - timestamp);
    if(d.getUTCMonth())         { return d.getUTCMonth() - 1 + 'ヶ月前'  }
    else if(d.getUTCDate() - 1) { return d.getUTCDate()  - 1 + '日前'  }
    else if(d.getUTCHours())    { return d.getUTCHours()     + '時間前' }
    else if(d.getUTCMinutes())  { return d.getUTCMinutes()   + '分前'  }
    else                        { return d.getUTCSeconds()   + '秒前'  }
  },
};

var app = new Vue({
  el: '#main',
  data: {
    isLoading: false,
    isLoaded : false,
    option: {
      start_at: 0,
      end_at: null,
      area: 5002,
      type: 1,
      page: null
    },
    rmnData: [],
    info: {
      isClicked: false,
      isSleep: false,
    },
  },
  methods: {
    getData: function() {
      this.setCurrentTime();
      this.isLoading = true;
      this.isLoaded = false;
      axios.get('https://datalake.iopt.jp/v1/sensor_data', {
          params: this.option
        })
        .then((response) => {
          this.isLoading = false;
          this.isLoaded = true;
          let jsonArray = response.data.body;
          jsonArray.forEach((e, i) => {
            this.rmnData.push({
              t: e.body.t * 1000,
              packet: e.body.p,
              apple: e.body.a,
              cpuTemp: Math.floor(e.body.c * 10)/10,
              battery: Math.floor(e.body.b * 10)/10
            });
          });
        })
        .catch((error) => {
          console.log(error);
        });  
    },
    setCurrentTime: function(offset) {
      this.option.end_at   = parseInt(Util.getCurrentTime()/1000      );
    },
    toggleView: function(e) {
      this.info.isClicked = !(this.info.isClicked);
    }
  },
  computed: {
    faceMode() {
      let now = (new Date()).getTime();
      if(this.rmnData.length > 0) {
        if((now - this.rmnData[0].t) > 60 * 60 * 1000
            || this.rmnData[0].battery < 0) {
          this.info.isSleep = true;
          return "sleep";
        }
      }
      this.info.isSleep = false;
      return "wake";
    },
    clock() {
      let t = (this.info.isSleep) ? (new Date()).getTime() : this.rmnData[0].t;
      return "<small>" + Util.getDateStr(t) + "</small>" +
             "<span>" + Util.getTimeStr(t) + "</span>";
    }
  }
});

app.getData();