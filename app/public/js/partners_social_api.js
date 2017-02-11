var accessToken;
var chIndex = 0;
var dbName;
var post_facebook_id;
var post_facebook_author_name;
var checkStatus = {};
var currentAnalysis;

window.fbAsyncInit = function() {
  FB.init({
    appId      : '1420745254855757',
    xfbml      : true,
    version    : 'v2.6'
  });
  FB.getLoginStatus(function(res) {
    if (res.status === 'connected') {
      console.log(res.status);
      $("#FB-loggedin").show();
      $("#FB-login").hide();
    }
  });
};

(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function FBlogin() {
  FB.login(function(response) {
    if (response.authResponse) {
      console.log('Welcome!  Fetching your information.... ');
      FB.api('/me', function(response) {
        console.log('Good to see you, ' + response.name + '.');
        $("#FB-loggedin").show();
        $("#FB-login").hide();
      });
    } else {
      console.log('User cancelled login or did not fully authorize.');
    }
  }, {scope: 'user_groups,user_likes'});
}

function loadAnalysis(id) {
  console.log("loadAnalysis "+id);
  currentAnalysis = id;
  console.log(action.analysis[id]);
}
function startAnalysis() {
  console.log("startAnalysis");
  if (!action.analysis) {
    action.analysis = [];
  }
  currentAnalysis = action.analysis.length;
  action.analysis[currentAnalysis] = {};
  action.analysis[currentAnalysis].date = new Date();
  if (action.facebook) {
    checkStatus.facebook = false;
    checkFBPostActivities();
  }
  if (action.twitter) {
    checkStatus.twitter = false;
    checkTWPostActivities();
  }
  $("#analysisList").addClass("hide");
  $("#startAnalysis").addClass("hide");
  $("#analysisResults").removeClass("hide");

  $("#logAnalysis").removeClass("hide");
  if (action.facebook) {
    $("#logAnalysis .statusFacebookCheck").removeClass("hide");
  }
  if (action.twitter) {
    $("#logAnalysis .statusTwitterCheck").removeClass("hide");
  }
  if (action.instagram) {
    $("#logAnalysis .statusInstagramCheck").removeClass("hide");
  }
  $("#logAnalysis .statusChannelsCheck").removeClass("hide");
  if (action.fbgroups) {
    $("#logAnalysis .statusExtraChannelsCheck").removeClass("hide");
  }
  $("#logAnalysis .statusNotMonitoredChannelsCheck").removeClass("hide");

}
function startCheck() {
  console.log("startCheck");
  var start = [];
  for (var item in checkStatus) start.push(checkStatus[item]);
  if (start.indexOf(false)==-1) checkChannels();
}
function checkFBPostActivities() {
  console.log("checkFBPostActivities");
  FB.getLoginStatus(function(res) {
    if (res.status === 'connected') {
      accessToken = res.authResponse.accessToken;
      getFBPostActivities(accessToken);
    }
  });
}

function getFBPostActivities(accessToken) {
  console.log("getFBPostActivities");
  var results = {};
  var data = action.facebook.split("/");
  if (!data[data.length-1]) data.pop();
  post_facebook_id = data[data.length-1];
  post_facebook_author_name = data[data.length-3];
  console.log("post_facebook_author");
  FB.api('/'+post_facebook_author_name, 'get', {access_token:accessToken}, function (user_data) {
    results.user_data = user_data;
    console.log("post_facebook_likes, comments, shares and share share, likes and comments");
    FB.api('/'+user_data.id+'_'+post_facebook_id+'?fields=comments{from},likes.limit(999),shares,sharedposts.limit(999){id,from,created_time,shares,comments,likes},created_time,from,is_popular', 'get', {access_token:accessToken}, function (results) {
      console.log("analizing likes");
      //console.log(results.likes);
      getFBNext(results.likes, accessToken, function (likes) {
        results.likes = likes;
        console.log("analizing shares");
        //console.log(results.sharedposts);
        getFBNext(results.sharedposts, accessToken, function (sharedposts) {
          results.sharedposts = sharedposts;
          console.log("analizing comments");
          //console.log(results.comments);
          getFBNext(results.comments, accessToken, function (comments) {
            console.log("finished");
            results.comments = comments;
            results.checkdate = new Date();
            action.analysis[currentAnalysis].facebook=results;
            $("#test").html(JSON.stringify(action, null, '\t'));
            //console.log(results);
            checkStatus.facebook = true;
            startCheck();
            drawFBPostActivities();
          });
        });
      });
    });
  });
}
function drawFBPostActivities(){
  console.log("drawResult");
  $.ajax({
    type: "POST",
    url: "/ajax/drawFBPostActivities",
    data: action,
    dataType: "html",
  }).done(function (html){
    $("#res_FB").html(html);
    $("#logAnalysis .statusFacebookCheck").addClass("hide");
    $("#logAnalysis .statusFacebookCheckDone").removeClass("hide");
  });
}
function getFBNext(o, accessToken, callback){
  console.log("getFBNext");
  var obj = o;
  console.log(obj.data);
  if (obj.paging && obj.paging.next) {
    FB.api(obj.paging.next, 'get', {access_token:accessToken}, function (results) {
      console.log(results);
      for (var item in obj.data) results.data.push(obj.data[item]);
      console.log(obj);
      if (results.paging && results.paging.next) {
        console.log("getFBNextgetFBNext");
        getFBNext(results, accessToken, callback);
      } else {
        console.log("finito");
        console.log(results);
        callback(results);
      }
    });
  } else {
    console.log("finitone");
    callback(obj);
  }

}


function checkChannels() {
  console.log("checkChannels");
  $('#table').bootstrapTable('destroy').bootstrapTable({
    columns: [
      {field: 'index', title: 'Index', sortable: true},
      {field: 'name', title: 'Name', sortable: true, formatter: "FBchannelPartnerLinkFormatter"},
      {field: 'type', title: 'Type', sortable: true, formatter: "FBchannelTypeFormatter"},
      {field: 'url', title: 'Url', sortable: true, formatter: "FBchannelUrlFormatter"},
      {field: 'lastpost', title: 'Last Post', sortable: true, formatter: "FBchannelTimeFormatter"},
      {field: 'likes', title: 'Members/Likes', sortable: true},
      {field: 'sharedpost', title: 'Shared', sortable: true, formatter: "FBchannelShareFormatter", sorter: "FBchannelShareSorter"},
      {field: 'liked', title: 'Liked', sortable: true, formatter: "FBchannelLikedFormatter"},
      {field: 'commented', title: 'Commented', sortable: true, formatter: "FBchannelCommentedFormatter"}
    ]
  });
  $('#table_extras').bootstrapTable('destroy').bootstrapTable({
    columns: [
      {field: 'index', title: 'Index', sortable: true},
      {field: 'name', title: 'Name', sortable: true, formatter: "FBchannelUrlFormatter"},
      {field: 'type', title: 'Type', sortable: true, formatter: "FBchannelTypeFormatter"},
      {field: 'lastpost', title: 'Last Post', sortable: true, formatter: "FBchannelTimeFormatter"},
      {field: 'likes', title: 'Members/Likes', sortable: true},
      {field: 'sharedpost', title: 'Shared', sortable: true, formatter: "FBchannelShareFormatter", sorter: "FBchannelShareSorter"},
      {field: 'liked', title: 'Liked', sortable: true, formatter: "FBchannelLikedFormatter"},
      {field: 'commented', title: 'Commented', sortable: true, formatter: "FBchannelCommentedFormatter"}
    ]
  });
  $('#table_not_partners').bootstrapTable('destroy').bootstrapTable({
    columns: [
      {field: 'index', title: 'Index', sortable: true},
      {field: 'name', title: 'Name', sortable: true, formatter: "FBchannelUrlFormatter"},
      {field: 'type', title: 'Type', sortable: true, formatter: "FBchannelTypeFormatter"},
      {field: 'lastpost', title: 'Last Post', sortable: true, formatter: "FBchannelTimeFormatter"},
      {field: 'likes', title: 'Members/Likes', sortable: true},
      {field: 'sharedpost', title: 'Shared', sortable: true, formatter: "FBchannelShareFormatter", sorter: "FBchannelShareSorter"},
      {field: 'liked', title: 'Liked', sortable: true, formatter: "FBchannelLikedFormatter"},
      {field: 'commented', title: 'Commented', sortable: true, formatter: "FBchannelCommentedFormatter"}
    ]
  });
  conta = chIndex = 0;
  setTimeout(checkChannel(), 500);
}
function checkChannel() {
  console.log("checkChannel");
  if (chIndex<action.partners_channels.length) {
    switch (action.partners_channels[chIndex].type) {
      case "FB-Group" :
        checkChannelFBchannel(action.partners_channels[chIndex],"members?limit=0&summary=total_count");
        break;
      case "FB-Page" :
        checkChannelFBchannel(action.partners_channels[chIndex],"?fields=fan_count");
        break;
      case "FB-Profile" :
        checkChannelFBchannel(action.partners_channels[chIndex],"friends?limit=0&summary=total_count");
        break;
      case "Twitter" :
        checkChannelTWchannel(action.partners_channels[chIndex],"friends?limit=0&summary=total_count");
        break;
      default :
        checkChannelNOTMonitoredchannel(action.partners_channels[chIndex],"");
        break;
    }
  } else {
    console.log("checkChannels End");
    $("#logAnalysis .statusChannelsCheck").addClass("hide");
    $("#logAnalysis .statusChannelsCheckDone").removeClass("hide");
    getNotPartners();
    if (action.fbgroups) checkExtraFBGroups();
  }
}

function checkChannelNOTMonitoredchannel(ch) {
  if (!action.analysis[currentAnalysis].channels) action.analysis[currentAnalysis].channels = [];
  action.analysis[currentAnalysis].channels.push(ch);
  $('#table').bootstrapTable('insertRow', {
    index: chIndex,
    row: {
      index: chIndex,
      name: ch.brand,
      _id: ch._id,
      id: "-",
      type: ch.type,
      profilename: ch.profilename,
      url: ch.url,
      lastpost: "-",
      likes: "-",
      sharedpost: "-",
      liked: "-",
      commented: "-"
    }
  });
  chIndex++;
  $("#test").html(JSON.stringify(action, null, '\t'));
  setTimeout(checkChannel(), 500);
}
function checkChannelTWchannel(ch, likes) {
  console.log("checkChannelTWchannel");
  console.log(ch);
  var data = ch.url.split("/");
  if (!data[data.length-1]) data.pop();
  var screen_name = data[data.length-1];
  console.log(screen_name);
  $.ajax({
    method: "POST",
    url: "https://lpm.dev.flyer.it/wp-content/themes/flyer-bs/includes/TwitterAPIExchange/",
    data: { post_TW_screen_name: screen_name }
  })
  .done(function( data ) {
    var result = JSON.parse(data)[0];
    console.log(result);
    ch.id = result.id;
    ch.likes = result.followers_count;
    ch.lastpost = result.status.created_at;
    ch.liked = false;
    ch.sharedpost = {};
    for (var item in action.analysis[currentAnalysis].twitter.likes)
      if (action.analysis[currentAnalysis].twitter.likes[item].id == ch.id)
        ch.liked = true;
    if (action.analysis[currentAnalysis].twitter.retweets)
      for (var item2 in action.analysis[currentAnalysis].twitter.retweets)
        if (action.analysis[currentAnalysis].twitter.retweets[item2].id == ch.id)
          ch.sharedpost = action.analysis[currentAnalysis].twitter.retweets[item2];
    if (!action.analysis[currentAnalysis].channels) action.analysis[currentAnalysis].channels = [];
    action.analysis[currentAnalysis].channels.push(ch);
    if (!action.analysis[currentAnalysis].channels_ids) action.analysis[currentAnalysis].channels_ids = [];
    action.analysis[currentAnalysis].channels_ids.push(ch.id.toString());
    $('#table').bootstrapTable('insertRow', {
      index: chIndex,
      row: {
        index: chIndex,
        name: ch.brand,
        _id: ch._id,
        id: ch.id,
        type: ch.type,
        profilename: ch.profilename,
        url: ch.url,
        lastpost: ch.lastpost,
        likes: ch.likes,
        sharedpost: ch.sharedpost,
        liked: ch.liked
      }
    });
    chIndex++;
    $("#test").html(JSON.stringify(action, null, '\t'));
    setTimeout(checkChannel(), 500);
  });
}
function checkChannelFBchannel(ch, likes) {
  FB.api('/'+ch.id+'/'+likes, 'get', {access_token:accessToken/*,limit:1500*/}, function (results) {
    console.log("checkChannelFBchannel "+likes);
    //console.log(results);
    var conta = 1;
    //getFBNext(results, accessToken, function (likes) {
    ch.likes = results.summary && results.summary.total_count ? results.summary.total_count : results.fan_count ? results.fan_count : "-";
    FB.api('/' + ch.id + '/feed?fields=created_time', 'get', {access_token: accessToken}, function (posts) {
      ch.liked = false;
      ch.sharedpost = {};
      ch.commented = false;
      ch.lastpost = posts.data && posts.data[0] && posts.data[0].created_time ? posts.data[0].created_time : "-";

      for (var item in action.analysis[currentAnalysis].facebook.likes.data)
        if (action.analysis[currentAnalysis].facebook.likes.data[item].id == ch.id)
          ch.liked = true;
      if (action.analysis[currentAnalysis].facebook.sharedposts)
        for (var item2 in action.analysis[currentAnalysis].facebook.sharedposts.data)
          if (action.analysis[currentAnalysis].facebook.sharedposts.data[item2].id.split("_")[0] == ch.id)
            ch.sharedpost = action.analysis[currentAnalysis].facebook.sharedposts.data[item2];


      for (var item3 in action.analysis[currentAnalysis].facebook.comments.data)
        if (action.analysis[currentAnalysis].facebook.comments.data[item3].id == ch.id)
          ch.commented = true;
      if (!action.analysis[currentAnalysis].channels) action.analysis[currentAnalysis].channels = [];
      action.analysis[currentAnalysis].channels.push(ch);
      if (!action.analysis[currentAnalysis].channels_ids) action.analysis[currentAnalysis].channels_ids = [];
      action.analysis[currentAnalysis].channels_ids.push(ch.id);
      $('#table').bootstrapTable('insertRow', {
        index: chIndex,
        row: {
          index: chIndex,
          name: ch.brand,
          _id: ch._id,
          id: ch.id,
          type: ch.type,
          profilename: ch.profilename,
          url: ch.url,
          lastpost: ch.lastpost,
          likes: ch.likes,
          sharedpost: ch.sharedpost,
          liked: ch.liked,
          commented: ch.commented
        }
      });
      chIndex++;
      $("#test").html(JSON.stringify(action, null, '\t'));
      setTimeout(checkChannel(), 500);
    });
  });
  //});
}

function getNotPartners() {
  console.log("getNotPartners");
  action.analysis[currentAnalysis].not_partners = [];
  var not_partners = {};
  for (var item in action.analysis[currentAnalysis].facebook.likes.data)
    if (action.analysis[currentAnalysis].channels_ids.indexOf(action.analysis[currentAnalysis].facebook.likes.data[item].id) == -1){
      var ch = action.analysis[currentAnalysis].facebook.likes.data[item];
      console.log("liked");
      console.log(ch);
      if (!not_partners[ch.id]) {
        not_partners[ch.id] = {
          id: ch.id,
          type: "FB",
          profilename: ch.name,
          lastpost: "-",
          url: "https://facebook.com/"+ch.id,
          //likes: ch.likes,
          sharedpost: {},
          liked: false,
          commented: false
        };
      }
      not_partners[ch.id].liked = true;
    }
  if (action.analysis[currentAnalysis].facebook.sharedposts)
    for (var item2 in action.analysis[currentAnalysis].facebook.sharedposts.data)
      if (action.analysis[currentAnalysis].channels_ids.indexOf(action.analysis[currentAnalysis].facebook.sharedposts.data[item2].id.split("_")[0]) == -1) {
        var ch = action.analysis[currentAnalysis].facebook.sharedposts.data[item2];
        console.log("fb shared");
        console.log(ch);
        if (!not_partners[ch.from.id]) {
          not_partners[ch.from.id] = {
            id: ch.from.id,
            type: "FB",
            profilename: ch.from.name,
            lastpost: "-",
            //likes: ch.likes,
            sharedpost: {},
            liked: false,
            commented: false
          };
        }
        not_partners[ch.from.id].sharedpost = ch;
      }

  for (var item3 in action.analysis[currentAnalysis].facebook.comments.data)
    if (action.analysis[currentAnalysis].channels_ids.indexOf(action.analysis[currentAnalysis].facebook.comments.data[item3].id) == -1){
      var ch = action.analysis[currentAnalysis].facebook.comments.data[item3];
      console.log("fb commented");
      console.log(ch);
      if (!not_partners[ch.from.id]) {
        not_partners[ch.from.id] = {
          id: ch.from.id,
          type: "FB",
          profilename: ch.from.name,
          lastpost: "-",
          //likes: ch.likes,
          sharedpost: {},
          liked: false,
          commented: false
        };
      }
      not_partners[ch.from.id].commented = true;
    }
  for (var item in action.analysis[currentAnalysis].twitter.likes)
    if (action.analysis[currentAnalysis].channels_ids.indexOf(action.analysis[currentAnalysis].twitter.likes[item].id) == -1){
      var ch = action.analysis[currentAnalysis].twitter.likes[item];
      console.log("twitter liked");
      console.log(ch);
      if (!not_partners[ch.id]) {
        not_partners[ch.id] = {
          id: ch.id,
          type: "Twitter",
          profilename: ch.profilename,
          lastpost: "-",
          url: ch.url,
          //likes: ch.likes,
          sharedpost: {},
          liked: true
        };
      }
      not_partners[ch.id].liked = true;
    }
  if (action.analysis[currentAnalysis].twitter.retweets)
    for (var item2 in action.analysis[currentAnalysis].twitter.retweets)
      if (action.analysis[currentAnalysis].channels_ids.indexOf(action.analysis[currentAnalysis].twitter.retweets[item2].user.id) == -1) {
        var ch = action.analysis[currentAnalysis].twitter.retweets[item2];
        console.log("twitter retweetted");
        console.log(ch);
        if (!not_partners[ch.user.id]) {
          not_partners[ch.user.id] = {
            id: ch.user.id,
            type: "Twitter",
            profilename: ch.user.name,
            lastpost: "-",
            url: "https://twitter.com/"+ch.user.screen_name,
            //likes: ch.likes,
            sharedpost: {},
            liked: false
          };
        }
        not_partners[ch.user.id].sharedpost = ch;
      }
  for (var item in not_partners)
    action.analysis[currentAnalysis].not_partners.push(not_partners[item]);
  drawnot_partners();
}
function drawnot_partners() {
  console.log("drawnot_partners");
  var index = 1;
  for (var item in action.analysis[currentAnalysis].not_partners){
    var ch = action.analysis[currentAnalysis].not_partners[item];
    console.log(ch);
    $('#table_not_partners').bootstrapTable('insertRow', {
      index: index,
      row: {
        index: index,
        name: ch.brand,
        _id: ch._id,
        id: ch.id,
        type: ch.type,
        profilename: ch.profilename,
        url: ch.url,
        lastpost: ch.lastpost,
        likes: ch.likes,
        sharedpost: ch.sharedpost,
        liked: ch.liked,
        commented: ch.commented
      }
    });
    index++;
  }
  console.log("drawnot_partners end");
  $("#logAnalysis .statusNotMonitoredChannelsCheck").addClass("hide");
  $("#logAnalysis .statusNotMonitoredChannelsCheckDone").removeClass("hide");
  if (!action.fbgroups) analysisEnd();
}



function FBchannelShareSorter(a,b){
  console.log("FBchannelShareSorter");
  console.log(a.created_time);
  if(!a.created_time) return -1;
  if(!b.created_time) return 1;
  // Turn your strings into dates, and then subtract them
  // to get a value that is either negative, positive, or zero.
  return new Date(b.created_time) - new Date(a.created_time);
}
function FBchannelUrlFormatter(value, row, index) {
  //var url = row.type=="Twitter" ? "https://twitter.com/account/redirect_by_id/"+row.id : row.type.indexOf("FB")!=-1 ? "https://facebook.com/"+row.id : row.url;
  return "<a href=\""+row.url+"\" target=\"_blank\">"+row.profilename+"</a>";
  //return "https://fb.com/"+row.id+"";
}
function FBchannelPartnerLinkFormatter(value, row, index) {
  var url = row._id ? "/"+dbName+"/partners/partner/"+row._id+"/" : row.url;
  return "<a href=\""+url+"\" target=\"_blank\">"+row.name+"</a>";
}
function FBchannelTimeFormatter(value, row, index) {
  var d = new Date(row.lastpost);
  var str = d.getDate() ? "<span class=\""+row.lastpost+"\">"+d.getDate()+" / "+(d.getMonth()+1)+" / "+d.getFullYear()+"</span>" : "<span>"+row.lastpost+"</span>";
  return str;
}
function FBchannelShareFormatter(value, row, index) {
  var str = "";
  var error;
  if ( ["Twitter","FB","FB-Group","FB-Page","FB-Profile"].indexOf(row.type)!=-1 ) {
    error = "<span class=\"label label-danger\">NOT SHARED</span>";
  } else {
    error = "-";
  }
  if (row.sharedpost && row.sharedpost.error) {
    str = "<span class=\"label label-danger\">"+row.sharedpost.error+"</span>";
  } else if (row.sharedpost) {
    if (row.type=="Twitter") {
      var d = new Date(row.sharedpost.created_at);
      var likes = row.sharedpost.favorite_count ? row.sharedpost.favorite_count : 0;
      var shares = row.sharedpost.retweet_count ? row.sharedpost.retweet_count : 0;
      str = d.getDate() ? "<a class=\""+row.sharedpost.created_at+"\" href=\""+row.url+"\" target=\"_blank\">"+d.getDate()+" / "+(d.getMonth()+1)+" / "+d.getFullYear()+"</a><br />R: "+shares+" / L: "+likes+"" : error;
    } else {
      var d = new Date(row.sharedpost.created_time);
      var likes = row.sharedpost.likes && row.sharedpost.likes.data && row.sharedpost.likes.data.length ? row.sharedpost.likes.data.length : 0;
      var shares = row.sharedpost.shares && row.sharedpost.shares.count ? row.sharedpost.shares.count : 0;
      var comments = row.sharedpost.comments && row.sharedpost.comments.count ? row.sharedpost.comments.count : 0;
      str = d.getDate() ? "<a class=\""+row.sharedpost.created_time+"\" href=\"https://facebook.com/"+row.sharedpost.id+"\" target=\"_blank\">"+d.getDate()+" / "+(d.getMonth()+1)+" / "+d.getFullYear()+"</a><br />S: "+shares+" / L: "+likes+" / C: "+comments+"" : error;
    }
  }
  return str;
}
function FBchannelCommentedFormatter(value, row, index) {
  if (row.type == "Twitter") return "-";
  if (row.commented == "-" ) return row.commented;
  return booleanFormatter(row.commented);
}
function FBchannelLikedFormatter(value, row, index) {
  if (row.liked == "-" ) return row.liked;
  return booleanFormatter(row.liked);
}
function booleanFormatter(val) {
  return "<span class=\"label label-"+(val ? "success" : "danger")+"\">"+val+"</span>";
}
function FBchannelTypeFormatter(value, row, index) {
  return "<span class=\"label label-primary\">"+row.type+"</span>";
}


function checkExtraFBGroups() {
  console.log("checkExtraFBGroups");
  if(action.extras && action.extras.length){
    action.extras.forEach(function(val,index,array){
      FB.api('/'+val.id+'/members?limit=0&summary=total_count', 'get', {access_token:accessToken,limit:1500}, function (group) {
        console.log(group);
        val.members = group.summary && group.summary.total_count ? group.summary.total_count : "-";
        console.log(val.members);
        FB.api('/'+val.id+'/feed?fields=created_time,parent_id,likes', 'get', {access_token:accessToken}, function (posts) {
          val.sharedpost = {};
          val.liked = false;
          val.commented = false;
          val.lastpost = posts.data && posts.data[0] && posts.data[0].created_time ? posts.data[0].created_time : "-";
          if (posts && posts.data) {
            for(var a=0;a<posts.data.length;a++) {
              if(posts.data[a].parent_id && posts.data[a].parent_id.split("_")[1] == post_facebook_id) {
                val.sharedpost = posts.data[a];
              }
            }
          }
          if (!action.analysis[currentAnalysis].extras) action.analysis[currentAnalysis].extras = [];
          action.analysis[currentAnalysis].extras.push(val);
          if (index==action.extras.length-1){
            $("#logAnalysis .statusExtraChannelsCheck").addClass("hide");
            $("#logAnalysis .statusExtraChannelsCheckDone").removeClass("hide");
            analysisEnd();
          }
          $('#table_extras').bootstrapTable('insertRow', {
            index: index,
            row: {
              index: index,
              id: val.id,
              profilename: val.name,
              type: val.type,
              likes: val.members,
              lastpost: val.lastpost,
              sharedpost: val.sharedpost,
              liked: val.liked,
              commented: val.commented
            }
          });
        });
      });
    });
  }
}

function saveAnalysis() {
  action.ajax = 1;
  $.ajax({
    type: "POST",
    url: "/"+dbName+"/partners/"+action.project+"/actions/"+action._id+"/edit",
    data: action,
    dataType: "json",
  }).done(function (msg){
    console.log("Analisis SAVE end");
    console.log(msg);
    console.log("/"+dbName+"/partners/"+action.project+"/actions/"+action._id+"/edit");
  });
}

function analysisEnd() {
  $('#saveAnalysis').removeClass("hide");

  console.log("Analisis end");
}

/*

 function CanPostFormatter(value, row, index) {
 return "<span class=\"label label-"+(row.can_post ? "success" : "danger")+"\">"+row.can_post+"</span>";
 }
 */



function checkTWPostActivities() {
  console.log("checkTWPostActivities");
  var data = action.twitter.split("/");
  if (!data[data.length-1]) data.pop();
  post_twitter_id = data[data.length-1];
  $.ajax({
    method: "POST",
    url: "https://lpm.dev.flyer.it/wp-content/themes/flyer-bs/includes/TwitterAPIExchange/",
    data: { post_TW_id: post_twitter_id }
  })
  .done(function( data ) {
    var results = JSON.parse(data);
    console.log(results);
    results.checkdate = new Date();
    results.likes = [];
    var page = results.page.htmlUsers;
    $(page).find(".account-group").each(function(index, item){
      results.likes.push({
        id:$(item).find("img").attr("data-user-id"),
        img:$(item).find("img").attr("src"),
        profilename:$(item).find(".fullname").html(),
        url:"https://twitter.com"+$(item).attr("href")
      });
    });
    delete results.page;
    action.analysis[currentAnalysis].twitter = results;
    $("#test").html(JSON.stringify(action, null, '\t'));
    //console.log(results);
    checkStatus.twitter = true;
    startCheck();
    drawTWPostActivities();
  });
}
function drawTWPostActivities(){
  console.log("drawTWPostActivities");
  $.ajax({
    type: "POST",
    url: "/ajax/drawTWPostActivities",
    data: action,
    dataType: "html",
  }).done(function (html){
    $("#logAnalysis .statusTwitterCheck").addClass("hide");
    $("#logAnalysis .statusTwitterCheckDone").removeClass("hide");
    $("#res_TW").html(html);
  });
}
