/**
 * Copyright 2006 Near Infinity Corporation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

//every appears courtesy https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Array/every
if (!Array.prototype.every)
{
  Array.prototype.every = function(fun /*, thisp*/)
  {
    var len = this.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this &&
          !fun.call(thisp, this[i], i, this))
        return false;
    }

    return true;
  };
}
if (!Array.prototype.some)
{
  Array.prototype.some = function(fun /*, thisp*/)
  {
    var i = 0,
        len = this.length >>> 0;

    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (; i < len; i++)
    {
      if (i in this &&
          fun.call(thisp, this[i], i, this))
        return true;
    }

    return false;
  };
}

/**
 * Finds an input element whose label has text matching the expression supplied. Expressions must
 * begin with "labeltext=".
 */
PageBot.prototype.locateElementByLabelText = function(labelText, inDocument) {
    var results = [];
    var inputs = [inDocument];
    var that = this;
    var filters = [];
    var filterspec = /(?:\s)([^=\s]+)=(.*)/;

    if (filterspec.test(labelText)) {
      var m = filterspec.exec(labelText);
      if (m[1] === 'within') {
        inputs =
          eval_xpath(
            m[2], inDocument, {
              returnOnFirstMatch : false,
              ignoreAttributesWithoutValue : that.ignoreAttributesWithoutValue,
              allowNativeXpath : that.allowNativeXpath,
              xpathLibrary : that.xpathLibrary,
              namespaceResolver : that._namespaceResolver});
        labelText = labelText.slice(0, m.index);
      }
      else {
        filters.push(m[0].slice(1));
        labelText = labelText.slice(0, m.index);
      }
    }
    var labels = [];
    for (var i in inputs) if (typeof(inputs[i]) !== 'function') {
      var iv = inputs[i].getElementsByTagName('label');
      for (var j in iv) if (typeof(iv[j]) !== 'function') {
        labels.push(iv[j]);
      }
    }

    for (var i = 0; labels && i < labels.length; i++) {
        var currentLabel = labels[i];

        //If the given pattern matches the text in this label
        if (PatternMatcher.matches(labelText, getText(currentLabel))) {
            //See if this label has a for attribute that matches the id of an input
            var forAttribute = currentLabel.attributes['for'] ? currentLabel.attributes['for'].value : null;
            if (forAttribute) {
                var referencedElement = inDocument.getElementById(forAttribute);

                //Make sure we found a valid element
                if (!referencedElement) {
                  throw new SeleniumError("Matched label refences an id (" + forAttribute + ") that does not exist!");
                }

                results.push(referencedElement);
                continue;
            }

            //If we get here, look in the label body for nested form controls
            var nestedElements = new Array();
            this.concatNodes(nestedElements, currentLabel.getElementsByTagName('input'));
            this.concatNodes(nestedElements, currentLabel.getElementsByTagName('select'));
            this.concatNodes(nestedElements, currentLabel.getElementsByTagName('textarea'));
            this.concatNodes(nestedElements, currentLabel.getElementsByTagName('button'));

            //A label should have exactly one nested form control
            if (nestedElements.length > 1) {
                throw new SeleniumError("Found " + nestedElements.length + " nested form elements in the matched label! Should only be one.");
            }
            else if (nestedElements.length == 1) {
                results.push(nestedElements[0]);
                continue;
            }

            //If we get here, we matched the label but found no form control
            throw new SeleniumError("Unable to find associated form control for label with text '" + getText(currentLabel) + "'.");
        }
    }

  while (filters.length) {
    results = this.selectElements(filters.shift(), results, 'value');
  }
  if (results.length < 1) {
    //We couldn't find it
    throw new SeleniumError("Unable to locate label with text '" + labelText + "'");
  }
  return results[0];
};

/**
 * Since node lists don't have a concat function and arrays don't know how to concat node lists, this function will do it for us.
 */
PageBot.prototype.concatNodes = function(targetArray, nodeList) {
    for (var i = 0; nodeList && i < nodeList.length; i++) {
        targetArray[targetArray.length] = nodeList[i];
    }
};


Selenium.prototype.orig_doSelect = Selenium.prototype.doSelect;

Selenium.prototype.doSelect = function(selectLocator, optionLocator) {
   var element = this.browserbot.findElement(selectLocator);
   element.focus();
   Selenium.prototype.orig_doSelect.call(this, selectLocator, optionLocator);
   element.blur();
};