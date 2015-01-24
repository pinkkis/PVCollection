this["JST"] = this["JST"] || {};

this["JST"]["src/templates/item.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"item\" data-uuid=\""
    + escapeExpression(((helper = (helper = helpers.uuid || (depth0 != null ? depth0.uuid : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"uuid","hash":{},"data":data}) : helper)))
    + "\">\r\n	<h3>title: "
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "</h3>\r\n	<ul>\r\n		<li>id: "
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "</li>\r\n	</ul>\r\n</div>";
},"useData":true});