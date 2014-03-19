
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Slider' });
};

exports.userlist = function(db) {
  return function(req, res) {
    var collection = db.get("usercollection");
    collection.find({}, {}, function(e, docs) {
      res.render('userlist', {
        "userlist" : docs
      });
    });
  };
};