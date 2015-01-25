this["JST"] = this["JST"] || {};

this["JST"]["src/templates/item.hbs"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, lambda=this.lambda;
  return "<div class=\"item\" data-uuid=\""
    + escapeExpression(((helper = (helper = helpers.guid || (depth0 != null ? depth0.guid : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"guid","hash":{},"data":data}) : helper)))
    + "\">\r\n	<h3>title: "
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</h3>\r\n	<ul>\r\n		<li>foo: "
    + escapeExpression(((helper = (helper = helpers.foo || (depth0 != null ? depth0.foo : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"foo","hash":{},"data":data}) : helper)))
    + "</li>\r\n		<li>bar: "
    + escapeExpression(((helper = (helper = helpers.bar || (depth0 != null ? depth0.bar : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"bar","hash":{},"data":data}) : helper)))
    + "</li>\r\n		<li>baz.thing: "
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.baz : depth0)) != null ? stack1.thing : stack1), depth0))
    + "</li>\r\n	</ul>\r\n</div>";
},"useData":true});