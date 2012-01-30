LocatorBuilders.add('labeltext', function(e) {
		if (e.id) {
			this.log.info("e.id = " + e.id);
			var locator = "xpath=" + "//" + "label[@for='" + e.id +"']" + "/span/text()";
			this.log.info("locator = " + locator);
			var label = this.findElement(locator);
			this.log.info("label = " + label.textContent);
			return "labeltext=" + label.textContent;
		}
		return null;
	});
	
// add labeltext Locator to the head of the priority of builders.
LocatorBuilders.order = ['labeltext', 'id', 'link', 'name', 'dom:name', 'xpath:link', 'xpath:img', 'xpath:attributes', 'xpath:href', 'dom:index', 'xpath:position'];