window.fbAsyncInit = function() {
  FB.init({
    appId      : '1420745254855757',
    xfbml      : true,
    version    : 'v2.0'
  });
  FB.getLoginStatus(function(res) {
    if (res.status === 'connected') {
      var columns = [];
      columns.push({field: 'index',			title: 'Index',			sortable: true});
      columns.push({field: 'name',			title: 'Name',			sortable: true,	 formatter:"LinkFormatter"});
      columns.push({field: 'url',				title: 'Url',			sortable: true,	 formatter:"UrlFormatter"});
      columns.push({field: 'type',			title: 'Type',			sortable: true});
      columns.push({field: 'can_post',		title: 'Can Post',		sortable: true,	 formatter:"CanPostFormatter"});
      columns.push({field: 'members',			title: 'Members',		sortable: true});
      columns.push({field: 'created_time',	title: 'Last Post',		sortable: true,	 formatter:"TimeFormatter"});
      columns.push({field: 'our_post',		title: 'Our Post',		sortable: true,	 formatter:"OurPostFormatter", sorter:"OurPostSorter"});
      var data = [];
      jQuery('#table').bootstrapTable('destroy').bootstrapTable({
        columns: columns,
        data: data
      });
      FB.api('/me', 'get', {access_token:res.authResponse.accessToken}, function (user_data) {
        console.log("user_data");
        console.log(user_data);
        jQuery("#username").html(user_data.name);
      });
      console.log(res);
      jQuery("#FB-loggedin").show();
      jQuery("#FB-login").hide();
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

var conta = 0;
var lastNext;
var sharer;
var liker;
var accessToken;
var post_id;
var check_post_id;
jQuery(function() {
  //getData();
});
function getData() {
  var config = loadJsonFileAjaxSync("https://spreadsheets.google.com/feeds/list/1sAqX96AjK69cTkZPkKBXG29dMNVSULnzntoTwCdJ2no/1/public/values?alt=json", "application/json", 0);
  console.log("getData");
  console.log(config);
  var partners = [];
  for (var row in config.feed.entry) {
    var partner = {
      delegate : config.feed.entry[row].gsx$person.$t,
      brand : config.feed.entry[row].gsx$displayname.$t,
      type  : config.feed.entry[row].gsx$event.$t=="X" ? "Event" : "Organization",
      country : config.feed.entry[row].gsx$country.$t,
      status : "ACTIVE",
      contacts : [],
      partnerships : [],
      channels : []

    };
    if (config.feed.entry[row].gsx$lpm.$t=="X") partner.partnerships.push({name:"LPM",avnode:config.feed.entry[row].gsx$avnode.$t=="X" ? true : false, notes:config.feed.entry[row].gsx$notes.$t+" "+config.feed.entry[row].gsx$status.$t});
    if (config.feed.entry[row].gsx$lcf.$t=="X") partner.partnerships.push({name:"LCF",group:config.feed.entry[row].gsx$group.$t, notes:config.feed.entry[row].gsx$notes.$t+" "+config.feed.entry[row].gsx$status.$t});
    if (config.feed.entry[row].gsx$website.$t) partner.websites = [config.feed.entry[row].gsx$website.$t];
    var contact = {};
    if (config.feed.entry[row].gsx$name.$t) contact.name = config.feed.entry[row].gsx$name.$t;
    if (config.feed.entry[row].gsx$surname.$t) contact.surname = config.feed.entry[row].gsx$surname.$t;
    if (config.feed.entry[row].gsx$email.$t) contact.email = config.feed.entry[row].gsx$email.$t;
    if (config.feed.entry[row].gsx$lang.$t && (contact.name || contact.surname || contact.email)) contact.lang = config.feed.entry[row].gsx$lang.$t;
    if (contact.lang) contact.types = ["Contact"];
    if (contact.lang) partner.contacts.push(contact);
    contact = {};
    if (config.feed.entry[row].gsx$ccname.$t) contact.name = config.feed.entry[row].gsx$ccname.$t;
    if (config.feed.entry[row].gsx$ccsurname.$t) contact.surname = config.feed.entry[row].gsx$ccsurname.$t;
    if (config.feed.entry[row].gsx$ccemail.$t) contact.email = config.feed.entry[row].gsx$ccemail.$t;
    if (config.feed.entry[row].gsx$lang.$t && (contact.name || contact.surname || contact.email)) contact.lang = config.feed.entry[row].gsx$lang.$t;
    if (contact.lang) contact.types = ["Head Master"];
    if (contact.lang) partner.contacts.push(contact);


    for (var item in config.feed.entry[row]) {
      if (item.indexOf("$")>0) {
        //partner[item.split("$")[1]] = config.feed.entry[row][item].$t;
      }
    }
    partners.push(partner);
  }
  console.log("Partners");
  console.log(partners);
  var config = loadJsonFileAjaxSync("https://spreadsheets.google.com/feeds/list/13VxuoM3TK6kWoDq313pgpJkPdK0GpoIiGIM5vToHfhY/1/public/values?alt=json", "application/json", 0);
  console.log("getData");
  console.log(config);
  for (var row in config.feed.entry) {
    console.log(config.feed.entry[row].gsx$partner.$t);
    var index=0;
    for (var item in partners) {
      if (partners[item].brand == config.feed.entry[row].gsx$partner.$t) {
        partners[item].channels.push({
          profilename: config.feed.entry[row].gsx$profilename.$t,
          type: config.feed.entry[row].gsx$type.$t,
          url: config.feed.entry[row].gsx$url.$t

        });
        //console.log("TROVATO"+index);
      } else {
        //console.log("NON TROVATO"+config.feed.entry[row].gsx$partner.$t);
      }
      index++;
    }
  }
  /*for (var row in config.feed.entry) {
    for (var item in partners) {
      if (partners[item].brand == config.feed.entry[row].gsx$partner.$t) {
        console.log("TROVATO " + partners[item].brand);
      } else {
        console.log("NON TROVATO "+partners[item].brand);
      }
    }
  }*/

  console.log("Partners");
  console.log(partners);
}

function FBlogin() {
  FB.login(function(response) {
    if (response.authResponse) {
      console.log('Welcome!  Fetching your information.... ');
      FB.api('/me', function(response) {
        console.log('Good to see you, ' + response.name + '.');
        jQuery("#FB-loggedin").show();
        jQuery("#FB-login").hide();
      });
    } else {
      console.log('User cancelled login or did not fully authorize.');
    }
  }, {scope: 'user_groups,user_likes'});
}

function OurPostSorter(a,b){
  console.log("OurPostSorter");
  console.log(a.created_time);
  if(!a.created_time) return -1;
  if(!b.created_time) return 1;
  // Turn your strings into dates, and then subtract them
  // to get a value that is either negative, positive, or zero.
  return new Date(b.created_time) - new Date(a.created_time);
}

function LinkFormatter(value, row, index) {
  return "<a href=\"https://facebook.com/"+row.id+"\" target=\"_blank\">"+row.name+"</a>";
}

function UrlFormatter(value, row, index) {
  return "https://facebook.com/"+row.id+"";
}

function CanPostFormatter(value, row, index) {
  return "<span class=\"label label-"+(row.can_post ? "success" : "danger")+"\">"+row.can_post+"</span>";
}

function TimeFormatter(value, row, index) {
  var d = new Date(row.created_time);
  var str = d.getDate() ? "<span class=\""+row.created_time+"\">"+d.getDate()+" / "+(d.getMonth()+1)+" / "+d.getFullYear()+"</span>" : "<span class=\"label label-danger\">"+row.created_time+"</span>";
  return str;
}

function OurPostFormatter(value, row, index) {
  var str = ""
  //console.log('OurPostFormatter');
  //console.log(row.our_post);
  //console.log(value);
  if (row.our_post && row.our_post.error) {
    str = "<span class=\"label label-danger\">"+row.our_post.error+"</span>"
  } else if (row.our_post) {
    var d = new Date(row.our_post.created_time);
    var likes = row.our_post.likes && row.our_post.likes.data && row.our_post.likes.data.length ? row.our_post.likes.data.length : 0;
    var shares = row.our_post.shares && row.our_post.shares.count ? row.our_post.shares.count : 0;
    str = d.getDate() ? "<a class=\""+row.our_post.created_time+"\" href=\"https://facebook.com/"+row.id+"\" target=\"_blank\">"+d.getDate()+" / "+(d.getMonth()+1)+" / "+d.getFullYear()+"</a> (S: "+shares+" / L: "+likes+")" : "<span class=\"label label-danger\">NOT SHARED 2</span>";
  }
  str+= 	row.our_post.liked ? " <span class=\"label label-success\">LIKED</span>" : " <span class=\"label label-danger\">NOT LIKED</span>";
  return str;
}

function checkGroups() {
  jQuery('#loading').show();
  FB.getLoginStatus(function(res) {
    if (res.status === 'connected') {
      var accessToken = res.authResponse.accessToken;
      jQuery('#table').bootstrapTable('removeAll');
      FB.api('/me/groups', 'get', {access_token:accessToken}, function (groups) {
        var conta = 1;
        groups.data.forEach(function(val,index,array){
          FB.api('/'+val.id+'/members', 'get', {access_token:accessToken,limit:1500}, function (group) {
            if (!group || group.error) {
              console.log('Error occured');
              val.members = "+1500";
            } else {
              val.members = group.data ? group.data.length==1500 ? "+"+group.data.length : group.data.length : "UNDEFINED";
            }
            console.log(val.members);
            FB.api('/'+val.id+'/feed?fields=created_time,parent_id,likes', 'get', {access_token:accessToken}, function (posts) {
              if (!posts || posts.error) {
                console.log('Error occured');
                console.log(posts.error);
                created_time = "Error occured";
              } else {
                var check_post = jQuery("#check_post").val().split("/");
                if (!check_post[check_post.length-1]) check_post.pop();
                check_post_id = check_post[check_post.length-1];
                check_post_user_name = check_post[check_post.length-3];

                var our_post = check_post_id ? {error:"NOT SHARED"} : {error:"NOTHING TO CHECK"};
                var created_time = "";
                if (check_post_id) {
                  for(var a=0;a<posts.data.length;a++) {
                    if(posts.data[a].parent_id && posts.data[a].parent_id.split("_")[1] == check_post_id) {
                      our_post = posts.data[a];
                    }
                  }
                }
                created_time = posts.data && posts.data[0] && posts.data[0].created_time ? posts.data[0].created_time : "UNDEFINED";
                jQuery('#table').bootstrapTable('insertRow', {
                  index: index,
                  row: {index: index, id:val.id, name: val.name, type:"GROUP", members:val.members, created_time:created_time, can_post:true,our_post:our_post}
                });
              }
              if (array.length==conta) jQuery('#loading').hide();
              conta++;
            });
          });
        });
      });
    }
  });
}





function checkPages() {
  FB.getLoginStatus(function(res) {
    if (res.status === 'connected') {
      console.log(res.status);
      jQuery('#loading').show();
      accessToken = res.authResponse.accessToken;
      jQuery('#table').bootstrapTable('removeAll');
      post = jQuery('#check_post').val();
      data = post.split("/");
      if (!data[data.length-1]) data.pop();
      post_id = data[data.length-1];
      post_author_name = data[data.length-3];
      jQuery('th[data-field="members"] .th-inner').html("Likes");
      getFBSocialActivities(post_author_name, post_id, accessToken, function(results){
        sharer = [];
        liker = [];
        results.sharedposts.forEach(function(element, index, array){
          sharer.push(element.from.id);
        });
        results.likes.forEach(function(element, index, array){
          liker.push(element.id);
        });
        getLikes('/me/likes?fields=name,can_post,posts{id,shares,likes},likes', accessToken, post_id, sharer, liker, 0);
      });
    }
  });
}
function restartPages() {
  jQuery('#loading').show();
  jQuery('#restart').hide();
  console.log("restartPages");
  console.log(lastNext);
  getLikes(lastNext,accessToken, check_post_id, sharer, liker, 0);
}
function getLikes(next,accessToken, check_post_id, sharer, liker, try_number) {
  lastNext = next;
  FB.api(next, 'get', {access_token:accessToken, limit:20}, function (likes) {
    //console.log(likes);
    if (!likes || likes.error) {
      console.log('Error occured');
      if (likes.error) console.log(likes.error);
      if (try_number<2) {
        setTimeout(function() {
          getLikes(next, accessToken, check_post_id, sharer, liker, try_number+1);
        }, 2000);
      } else {
        if (try_number>0) {
          jQuery('#restart').show();
        }
        jQuery('#loading').hide();
      }
    } else {
      likes.data.forEach(function(val,index,array){
        var our_post = {error:"NO POSTS"};
        var created_time = "undefined";
        //console.log(val);
        if (val.posts) {
          our_post = {error:"NOT SHARED"};
          val.lastpost = val.posts.data ? val.posts.data[0] : {};
          created_time = val.lastpost.created_time ? val.lastpost.created_time : "undefined";
          if (sharer.indexOf(val.id)!=-1){
            for(var a=0;a<val.posts.data.length;a++) {
              //console.log(val.posts.data[a]);
              var getparent = loadJsonFileAjaxSync("https://graph.facebook.com/v2.0/"+val.posts.data[a].id+"?fields=parent_id&access_token="+accessToken, "application/json", 0);
              if (getparent && getparent.parent_id	) {
                console.log(getparent.parent_id);
                val.posts.data[a].parent_id = getparent.parent_id;
                if(val.posts.data[a].parent_id && val.posts.data[a].parent_id.split("_")[1] == check_post_id) {
                  our_post = val.posts.data[a];
                }
              }
            }
            console.log("Ha condiviso ");
          }
          if (liker.indexOf(val.id)!=-1){
            our_post.liked = true;
            console.log("Ha likato ");
          }
        }
        jQuery('#table').bootstrapTable('insertRow', {
          index: conta,
          row: {index: conta, id:val.id, name: val.name, type:"PAGE", members:val.likes, created_time:created_time, can_post:val.can_post,our_post:our_post}
        });
        conta++;
        if (array.length-1==index) {

          if (likes.paging.next) {
            setTimeout(function() {
              console.log("LOADING NEXT "+likes.paging.next);
              getLikes(likes.paging.next, accessToken, check_post_id, sharer, liker, 0);
            }, 2000);
          } else {
            console.log("FINITO");
            jQuery('#loading').hide();
          }
        }
      });
    }
  });

}
function loadJsonFileAjaxSync(filePath, mimeType, try_number) {
  var xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET",filePath,false);
  if (mimeType != null) {
    if (xmlhttp.overrideMimeType) {
      xmlhttp.overrideMimeType(mimeType);
    }
  }
  xmlhttp.send();
  if (xmlhttp.status==200) {
    return JSON.parse(xmlhttp.responseText);
  } else if (try_number<2) {
    return loadJsonFileAjaxSync(filePath, mimeType, try_number+1);
  } else {
    return null;
  }
}
