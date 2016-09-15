(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var _ = Package.underscore._;

/* Package-scope variables */
var HTMLParser, UniHTML;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/vazco_universe-html-purifier/packages/vazco_universe-htm //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/vazco:universe-html-purifier/HTMLParser.js                                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
/*                                                                                                                    // 1
 * HTML Parser By John Resig (ejohn.org)                                                                              // 2
 * Original code by Erik Arvidsson, Licensed under the Apache License, Version 2.0 or Mozilla Public License          // 3
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js                                                           // 4
                                                                                                                      // 5
 * added support of HTML5 by Krzysztof Różalski <cristo.rabani@gmail.com>                                             // 6
 */                                                                                                                   // 7
                                                                                                                      // 8
// Regular Expressions for parsing tags and attributes (modified attribute name matcher, to catch xml:lang)           // 9
var startTag = /^<([\w-]+\:?\w*)((?:\s+[a-zA-Z_:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,      // 10
	endTag = /^<\/([\w-]+)[^>]*>/,                                                                                       // 11
	attr = /([\w-]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;                             // 12
                                                                                                                      // 13
function makeMap(str){                                                                                                // 14
	var obj = {}, items = str.split(",");                                                                                // 15
	for ( var i = 0; i < items.length; i++ )                                                                             // 16
		obj[ items[i] ] = true;                                                                                             // 17
	return obj;                                                                                                          // 18
}                                                                                                                     // 19
                                                                                                                      // 20
var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,keygen,link,meta,menuitem,source,track,param,embed,wbr");
                                                                                                                      // 22
var block = makeMap("article,aside,address,applet,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,form,footer,frameset,hr,iframe,header,hgroup,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,progress,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");
                                                                                                                      // 24
var inline = makeMap("a,abbr,acronym,applet,audio,b,basefont,bdo,big,br,button,cite,code,command,del,details,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,mark,meter,nav,object,q,s,samp,script,select,small,span,strike,strong,sub,summary,sup,textarea,tt,u,time,var");
                                                                                                                      // 26
// Elements that you can, intentionally, leave open                                                                   // 27
// (and which close themselves)                                                                                       // 28
var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");                                          // 29
                                                                                                                      // 30
// Attributes that have their values filled in disabled="disabled"                                                    // 31
var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");
                                                                                                                      // 33
// Special Elements (can contain anything)                                                                            // 34
var special = makeMap("script,style");                                                                                // 35
                                                                                                                      // 36
HTMLParser = function( html, handler ) {                                                                              // 37
	var index, chars, match, stack = [], last = html;                                                                    // 38
	stack.last = function(){                                                                                             // 39
		return this[ this.length - 1 ];                                                                                     // 40
	};                                                                                                                   // 41
                                                                                                                      // 42
	function parseStartTag( tag, tagName, rest, unary ) {                                                                // 43
		if ( block[ tagName ] ) {                                                                                           // 44
			while ( stack.last() && inline[ stack.last() ] ) {                                                                 // 45
				parseEndTag( "", stack.last() );                                                                                  // 46
			}                                                                                                                  // 47
		}                                                                                                                   // 48
                                                                                                                      // 49
		if ( closeSelf[ tagName ] && stack.last() === tagName ) {                                                           // 50
			parseEndTag( "", tagName );                                                                                        // 51
		}                                                                                                                   // 52
                                                                                                                      // 53
		unary = empty[ tagName ] || !!unary;                                                                                // 54
                                                                                                                      // 55
		if ( !unary )                                                                                                       // 56
			stack.push( tagName );                                                                                             // 57
                                                                                                                      // 58
		if ( handler.start ) {                                                                                              // 59
			var attrs = [];                                                                                                    // 60
                                                                                                                      // 61
			rest.replace(attr, function(match, name) {                                                                         // 62
				var value = arguments[2] ? arguments[2] :                                                                         // 63
					arguments[3] ? arguments[3] :                                                                                    // 64
					arguments[4] ? arguments[4] :                                                                                    // 65
					fillAttrs[name] ? name : "";                                                                                     // 66
                                                                                                                      // 67
				attrs.push({                                                                                                      // 68
					name: name,                                                                                                      // 69
					value: value,                                                                                                    // 70
					escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"                                                              // 71
				});                                                                                                               // 72
			});                                                                                                                // 73
                                                                                                                      // 74
			if ( handler.start )                                                                                               // 75
				handler.start( tagName, attrs, unary );                                                                           // 76
		}                                                                                                                   // 77
	}                                                                                                                    // 78
                                                                                                                      // 79
	function parseEndTag( tag, tagName ) {                                                                               // 80
		var pos;                                                                                                            // 81
                                                                                                                      // 82
		// If no tag name is provided, clean shop                                                                           // 83
		if (!tagName) {                                                                                                     // 84
			pos = 0;                                                                                                           // 85
		}                                                                                                                   // 86
                                                                                                                      // 87
		// Find the closest opened tag of the same type                                                                     // 88
		else                                                                                                                // 89
			for ( pos = stack.length - 1; pos >= 0; pos-- )                                                                    // 90
				if ( stack[ pos ] === tagName )                                                                                   // 91
					break;                                                                                                           // 92
                                                                                                                      // 93
		if ( pos >= 0 ) {                                                                                                   // 94
			// Close all the open elements, up the stack                                                                       // 95
			for ( var i = stack.length - 1; i >= pos; i-- )                                                                    // 96
				if ( handler.end )                                                                                                // 97
					handler.end( stack[ i ] );                                                                                       // 98
                                                                                                                      // 99
			// Remove the open elements from the stack                                                                         // 100
			stack.length = pos;                                                                                                // 101
		}                                                                                                                   // 102
	}                                                                                                                    // 103
                                                                                                                      // 104
	while ( html ) {                                                                                                     // 105
		chars = true;                                                                                                       // 106
		// Make sure we're not in a script or style element                                                                 // 107
		if ( !stack.last() || !special[ stack.last() ] ) {                                                                  // 108
                                                                                                                      // 109
			// Comment                                                                                                         // 110
			if ( html.indexOf("<!--") === 0 ) {                                                                                // 111
				index = html.indexOf("-->");                                                                                      // 112
                                                                                                                      // 113
				if ( index >= 0 ) {                                                                                               // 114
					if ( handler.comment )                                                                                           // 115
						handler.comment( html.substring( 4, index ) );                                                                  // 116
					html = html.substring( index + 3 );                                                                              // 117
					chars = false;                                                                                                   // 118
				}                                                                                                                 // 119
                                                                                                                      // 120
			// end tag                                                                                                         // 121
			} else if ( html.indexOf("</") === 0 ) {                                                                           // 122
				match = html.match( endTag );                                                                                     // 123
                                                                                                                      // 124
				if ( match ) {                                                                                                    // 125
					html = html.substring( match[0].length );                                                                        // 126
					match[0].replace( endTag, parseEndTag );                                                                         // 127
					chars = false;                                                                                                   // 128
				}                                                                                                                 // 129
                                                                                                                      // 130
			// start tag                                                                                                       // 131
			} else if ( html.indexOf("<") === 0 && !/^(<)[^>]*(?:<|$)/gm.test(html)) {                                         // 132
				match = html.match( startTag );                                                                                   // 133
                                                                                                                      // 134
				if ( match ) {                                                                                                    // 135
					html = html.substring( match[0].length );                                                                        // 136
					match[0].replace( startTag, parseStartTag );                                                                     // 137
					chars = false;                                                                                                   // 138
				}                                                                                                                 // 139
			}                                                                                                                  // 140
                                                                                                                      // 141
			if ( chars ) {                                                                                                     // 142
				index = html.indexOf("<");                                                                                        // 143
				if(/(<)[^>]*(?:<|$)/gm.test(html)){                                                                               // 144
					index = html.search(/(<)[^>]*(?:<|$)/gm)+1;                                                                      // 145
				}                                                                                                                 // 146
				var text = index < 0 ? html : html.substring( 0, index );                                                         // 147
				html = index < 0 ? "" : html.substring( index );                                                                  // 148
                                                                                                                      // 149
				if ( handler.chars )                                                                                              // 150
					handler.chars( text );                                                                                           // 151
			}                                                                                                                  // 152
                                                                                                                      // 153
		} else {                                                                                                            // 154
			html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text){                          // 155
				text = text.replace(/<!--(.*?)-->/g, "$1")                                                                        // 156
					.replace(/<!\[CDATA\[(.*?)]]>/g, "$1");                                                                          // 157
                                                                                                                      // 158
				if ( handler.chars )                                                                                              // 159
					handler.chars( text );                                                                                           // 160
                                                                                                                      // 161
				return "";                                                                                                        // 162
			});                                                                                                                // 163
                                                                                                                      // 164
			parseEndTag( "", stack.last() );                                                                                   // 165
		}                                                                                                                   // 166
                                                                                                                      // 167
		if ( html === last )                                                                                                // 168
			throw "Parse Error: " + html;                                                                                      // 169
		last = html;                                                                                                        // 170
	}                                                                                                                    // 171
                                                                                                                      // 172
	// Clean up any remaining tags                                                                                       // 173
	parseEndTag();                                                                                                       // 174
};                                                                                                                    // 175
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/vazco:universe-html-purifier/HTMLPurifier.js                                                              //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
'use strict';                                                                                                         // 1
                                                                                                                      // 2
var htmlPurifier = function(settings){                                                                                // 3
    var allowHeaders = true;                                                                                          // 4
    var stack = [];                                                                                                   // 5
    var active_elements = [];                                                                                         // 6
    var customTags = {};                                                                                              // 7
    var noTextManhandle = false;                                                                                      // 8
    var encodeHtmlEntities = false;                                                                                   // 9
    var root;                                                                                                         // 10
    var insertion_mode;                                                                                               // 11
    var noFormatting;                                                                                                 // 12
    var preferB_I = false;                                                                                            // 13
    var preferStrong_Em = false;                                                                                      // 14
    var withoutTags;                                                                                                  // 15
                                                                                                                      // 16
                                                                                                                      // 17
    var scope_markers = {'td': true, 'th': true, 'caption': true};                                                    // 18
    var tags_with_implied_end = {'li': true, 'p': true};                                                              // 19
    var allowed_attributes = {                                                                                        // 20
        all_elements: ['class', 'style', 'id'],                                                                       // 21
        a: ['href', 'target', 'title', 'name', 'rel', 'rev', 'type'],                                                 // 22
        blockquote: ['cite'],                                                                                         // 23
        img: ['src', 'alt', 'title', 'longdesc'],                                                                     // 24
        td: ['colspan'],                                                                                              // 25
        th: ['colspan'],                                                                                              // 26
        tr: ['rowspan'],                                                                                              // 27
        table: ['border']                                                                                             // 28
    };                                                                                                                // 29
    var allowed_attributes_as_hash;                                                                                   // 30
    var selfClosing = {                                                                                               // 31
        br: true,                                                                                                     // 32
        hr: true,                                                                                                     // 33
        img: true                                                                                                     // 34
    };                                                                                                                // 35
    var dontIndent = {                                                                                                // 36
        strong: true,                                                                                                 // 37
        b: true,                                                                                                      // 38
        i: true,                                                                                                      // 39
        em: true,                                                                                                     // 40
        pre: true                                                                                                     // 41
    };                                                                                                                // 42
    var indent = false;                                                                                               // 43
    var indent_string = "    ";                                                                                       // 44
    var indentation = function (depth, switchOff) {                                                                   // 45
        if (noFormatting) return "";                                                                                  // 46
        if (!indent) return "";                                                                                       // 47
        if (switchOff) indent = false;                                                                                // 48
        var result = "\n";                                                                                            // 49
        for (var i = 0; i < depth; i++) {                                                                             // 50
            result += indent_string;                                                                                  // 51
        }                                                                                                             // 52
        return result;                                                                                                // 53
    };                                                                                                                // 54
                                                                                                                      // 55
    var TextNode = function (text) {                                                                                  // 56
        this.text = noTextManhandle ? text : text.replace(/\s+/g, ' ');                                               // 57
    };                                                                                                                // 58
                                                                                                                      // 59
    TextNode.prototype = {                                                                                            // 60
        isEmpty: function () {                                                                                        // 61
            return !this.text;                                                                                        // 62
        },                                                                                                            // 63
        textContent: function () {                                                                                    // 64
            return this.text;                                                                                         // 65
        },                                                                                                            // 66
        toString: function () {                                                                                       // 67
            return this.isEmpty() ? '' : indentation(this.depth(), true) + this.text.replace(/(&nbsp;)+/, ' ');       // 68
        },                                                                                                            // 69
        depth: function () {                                                                                          // 70
            return this.parent.depth() + 1;                                                                           // 71
        }                                                                                                             // 72
    };                                                                                                                // 73
                                                                                                                      // 74
    var Node = function (name) {                                                                                      // 75
        this.name = name;                                                                                             // 76
        this.children = [];                                                                                           // 77
        this.attributes = {};                                                                                         // 78
    };                                                                                                                // 79
                                                                                                                      // 80
    Node.prototype = {                                                                                                // 81
        appendChild: function (child) {                                                                               // 82
            this.children.push(child);                                                                                // 83
            child.parent = this;                                                                                      // 84
            return child;                                                                                             // 85
        },                                                                                                            // 86
        removeChild: function (child) {                                                                               // 87
            for (var i = 0, len = this.children.length; i < len; i++) {                                               // 88
                if (this.children[i] === child) {                                                                     // 89
                    return this.children.splice(i, i);                                                                // 90
                }                                                                                                     // 91
            }                                                                                                         // 92
            return null;                                                                                              // 93
        },                                                                                                            // 94
        lastChild: function () {                                                                                      // 95
            return this.children[this.children.length - 1];                                                           // 96
        },                                                                                                            // 97
        clone: function () {                                                                                          // 98
            var clone = new Node(this.name);                                                                          // 99
            for (var i in this.attributes) {                                                                          // 100
                clone.attributes[i] = this.attributes[i];                                                             // 101
            }                                                                                                         // 102
            return clone;                                                                                             // 103
        },                                                                                                            // 104
        startTag: function () {                                                                                       // 105
            return "<" + this.name + this.attributeString() + ">";                                                    // 106
        },                                                                                                            // 107
        endTag: function () {                                                                                         // 108
            return "</" + this.name + ">";                                                                            // 109
        },                                                                                                            // 110
        selfClosingTag: function () {                                                                                 // 111
            return "<" + this.name + this.attributeString() + "/>";                                                   // 112
        },                                                                                                            // 113
        attributeString: function () {                                                                                // 114
            var string = "";                                                                                          // 115
                                                                                                                      // 116
            var allowed_for_tag = allowed_attributes_as_hash[this.name] || {};                                        // 117
            var allowed_for_all = allowed_attributes_as_hash['all_elements'] || {};                                   // 118
                                                                                                                      // 119
            for (var i = 0, len = (this.attributes || []).length; i < len; i++) {                                     // 120
                var name = this.attributes[i].name;                                                                   // 121
                var value = this.attributes[i].value;                                                                 // 122
                if ((allowed_for_tag[name] || allowed_for_all[name]) && value) {                                      // 123
                    if (name === 'href') {                                                                            // 124
                        // don't allow links to anywhere other than http(s)                                           // 125
                        // because they could contain JavaScript (javascript:) or other bad things!                   // 126
                        var permittedRegex = /(?:^https?:\/\/)|(?:^\/[^:\\;\(\)"']*$)|(?:^s?ftps?:\/\/)|(?:^#[^\/]*)|(?:^mailto:)/i;
                        if (!permittedRegex.test(value) || /script:/.test(value)) {                                   // 128
                            // if not allowed, set the attribute to be empty                                          // 129
                            value = '';                                                                               // 130
                        }                                                                                             // 131
                    }                                                                                                 // 132
                                                                                                                      // 133
                    string += " " + name + "=\"" + value + "\"";                                                      // 134
                }                                                                                                     // 135
            }                                                                                                         // 136
            return string;                                                                                            // 137
        },                                                                                                            // 138
        innerHTML: function () {                                                                                      // 139
            var string = "";                                                                                          // 140
            for (var i = 0, len = this.children.length; i < len; i++) {                                               // 141
                string += this.children[i];                                                                           // 142
            }                                                                                                         // 143
            return string;                                                                                            // 144
        },                                                                                                            // 145
        textContent: function () {                                                                                    // 146
            var text = "";                                                                                            // 147
            for (var i = 0, len = this.children.length; i < len; i++) {                                               // 148
                if (this.children[i] instanceof TextNode) {                                                           // 149
                    text += this.children[i].text;                                                                    // 150
                }                                                                                                     // 151
            }                                                                                                         // 152
            return text;                                                                                              // 153
        },                                                                                                            // 154
        toString: function () {                                                                                       // 155
            if (this.isEmpty()) return '';                                                                            // 156
                                                                                                                      // 157
            var string = "";                                                                                          // 158
            if (selfClosing[this.name]) {                                                                             // 159
                string = indentation(this.depth(), true) + this.selfClosingTag();                                     // 160
            } else {                                                                                                  // 161
                indent = dontIndent[this.name] ? indent : true;                                                       // 162
                string = indentation(this.depth(), dontIndent[this.name]) + this.startTag() + this.innerHTML();       // 163
                indent = dontIndent[this.name] ? indent : true;                                                       // 164
                string += indentation(this.depth()) + this.endTag();                                                  // 165
            }                                                                                                         // 166
            return string;                                                                                            // 167
        },                                                                                                            // 168
        depth: function () {                                                                                          // 169
            return this.parent ? this.parent.depth() + 1 : -1;                                                        // 170
        },                                                                                                            // 171
        isEmpty: function () {                                                                                        // 172
            // Zaption mod: self-closing elements never count as empty                                                // 173
            // otherwise <p><br/></p> gets removed entirely                                                           // 174
            if (selfClosing[this.name]) {                                                                             // 175
                return false;                                                                                         // 176
            }                                                                                                         // 177
                                                                                                                      // 178
            if (typeof(this._isEmpty) === "undefined") {                                                              // 179
                this._isEmpty = true;                                                                                 // 180
                for (var i = 0, len = this.children.length; i < len; i++) {                                           // 181
                    if (!this.children[i].isEmpty()) {                                                                // 182
                        this._isEmpty = false;                                                                        // 183
                        break;                                                                                        // 184
                    }                                                                                                 // 185
                }                                                                                                     // 186
            }                                                                                                         // 187
            return this._isEmpty;                                                                                     // 188
        }                                                                                                             // 189
    };                                                                                                                // 190
                                                                                                                      // 191
    function init(settings) {                                                                                         // 192
        var modes = {                                                                                                 // 193
            InBody: InBody,                                                                                           // 194
            InCell: InCell,                                                                                           // 195
            InRow: InRow,                                                                                             // 196
            InTableBody: InTableBody,                                                                                 // 197
            InColumnGroup: InColumnGroup,                                                                             // 198
            InCaption: InCaption,                                                                                     // 199
            InTable: InTable                                                                                          // 200
        };                                                                                                            // 201
        if(!settings.insertion_mode || !modes[settings.insertion_mode]){                                              // 202
            settings.insertion_mode = 'InBody';                                                                       // 203
        };                                                                                                            // 204
        insertion_mode = modes[settings.insertion_mode];                                                              // 205
        _.extend(allowed_attributes, settings.allowed_attributes);                                                    // 206
        _.extend(customTags, settings.customTags);                                                                    // 207
        _.extend(selfClosing, settings.selfClosingTags);                                                              // 208
                                                                                                                      // 209
        root = new Node('html');                                                                                      // 210
        stack = [root];                                                                                               // 211
        active_elements = [];                                                                                         // 212
        allowed_attributes_as_hash = {};                                                                              // 213
                                                                                                                      // 214
                                                                                                                      // 215
        var attr, i;                                                                                                  // 216
        for (var key in allowed_attributes) {                                                                         // 217
            allowed_attributes_as_hash[key] = {};                                                                     // 218
            for (i in allowed_attributes['all_elements']) {                                                           // 219
                attr = allowed_attributes['all_elements'][i];                                                         // 220
                allowed_attributes_as_hash[key][attr] = true;                                                         // 221
            }                                                                                                         // 222
            if (key === 'all_elements') {                                                                             // 223
                continue;                                                                                             // 224
            }                                                                                                         // 225
            for (i in allowed_attributes[key]) {                                                                      // 226
                attr = allowed_attributes[key][i];                                                                    // 227
                allowed_attributes_as_hash[key][attr] = true;                                                         // 228
            }                                                                                                         // 229
        }                                                                                                             // 230
                                                                                                                      // 231
        noFormatting = !!settings.noFormatting;                                                                       // 232
        if(settings.noTextManhandle){                                                                                 // 233
            noTextManhandle = true;                                                                                   // 234
            noFormatting = true;                                                                                      // 235
        }                                                                                                             // 236
        encodeHtmlEntities = settings.encodeHtmlEntities;                                                             // 237
        preferStrong_Em = !!settings.preferStrong_Em;                                                                 // 238
        preferB_I = !preferStrong_Em && !!settings.preferB_I;                                                         // 239
        allowHeaders = !settings.noHeaders;                                                                           // 240
        withoutTags = {};                                                                                             // 241
                                                                                                                      // 242
        if(typeof settings.withoutTags === 'string' && settings.withoutTags){                                         // 243
            settings.withoutTags = [settings.withoutTags];                                                            // 244
        }                                                                                                             // 245
                                                                                                                      // 246
        if(settings.withoutTags && settings.withoutTags.length){                                                      // 247
            for (var i = settings.withoutTags.length -1 ; i >= 0; i--) {                                              // 248
                withoutTags[settings.withoutTags[i]] = true;                                                          // 249
            }                                                                                                         // 250
        }                                                                                                             // 251
    }                                                                                                                 // 252
                                                                                                                      // 253
    function current_node() {                                                                                         // 254
        return _.last(stack);                                                                                         // 255
    }                                                                                                                 // 256
                                                                                                                      // 257
    function reconstruct_the_active_formatting_elements() {                                                           // 258
        if (active_elements.length === 0 || _.contains(stack, _.last(active_elements))) {                             // 259
            return;                                                                                                   // 260
        }                                                                                                             // 261
        var entry;                                                                                                    // 262
        for (var i = active_elements.length; i > 0; i--) {                                                            // 263
            entry = active_elements[i - 1];                                                                           // 264
            if (_.contains(stack, entry)) {                                                                           // 265
                break;                                                                                                // 266
            }                                                                                                         // 267
        }                                                                                                             // 268
        do {                                                                                                          // 269
            var clone = entry.clone();                                                                                // 270
            current_node().appendChild(clone);                                                                        // 271
            stack.push(clone);                                                                                        // 272
            active_elements[i] = clone;                                                                               // 273
            i += 1;                                                                                                   // 274
        } while (i !== active_elements.length);                                                                       // 275
    }                                                                                                                 // 276
                                                                                                                      // 277
    function has_element_with(arr_of_elements, tagName) {                                                             // 278
        for (var i = arr_of_elements.length; i > 0; i--) {                                                            // 279
            if (arr_of_elements[i - 1].name === tagName) {                                                            // 280
                return true;                                                                                          // 281
            }                                                                                                         // 282
        }                                                                                                             // 283
        return false;                                                                                                 // 284
    }                                                                                                                 // 285
                                                                                                                      // 286
    function in_scope(tagName) {                                                                                      // 287
        return has_element_with(stack, tagName);                                                                      // 288
    }                                                                                                                 // 289
                                                                                                                      // 290
    function in_table_scope(tagName) {                                                                                // 291
        for (var i = stack.length; i > 0; i--) {                                                                      // 292
            var nodeTag = stack[i - 1].name;                                                                          // 293
            if (nodeTag === tagName) {                                                                                // 294
                return true;                                                                                          // 295
            } else if (nodeTag === 'table' || nodeTag === 'html') {                                                   // 296
                return false;                                                                                         // 297
            }                                                                                                         // 298
        }                                                                                                             // 299
        return false;                                                                                                 // 300
    }                                                                                                                 // 301
                                                                                                                      // 302
    function insert_html_element_for(tagName, attrs) {                                                                // 303
        var node = new Node(tagName);                                                                                 // 304
        node.attributes = attrs;                                                                                      // 305
        current_node().appendChild(node);                                                                             // 306
        stack.push(node);                                                                                             // 307
        return node;                                                                                                  // 308
    }                                                                                                                 // 309
                                                                                                                      // 310
    function generate_implied_end_tags(exception) {                                                                   // 311
        var tagName = current_node().name;                                                                            // 312
        while (tags_with_implied_end[tagName] && tagName !== exception) {                                             // 313
            end(tagName);                                                                                             // 314
            tagName = current_node().name;                                                                            // 315
        }                                                                                                             // 316
    }                                                                                                                 // 317
                                                                                                                      // 318
    function trim_to_1_space(str) {                                                                                   // 319
        return noTextManhandle? str : str.replace(/^\s+/, ' ').replace(/\s+$/, ' ');                                  // 320
    }                                                                                                                 // 321
                                                                                                                      // 322
    function clear_stack_to_table_context() {                                                                         // 323
        clear_stack_to_context_by_tags(['table', 'html']);                                                            // 324
    }                                                                                                                 // 325
                                                                                                                      // 326
    function clear_stack_to_table_body_context() {                                                                    // 327
        clear_stack_to_context_by_tags(['tbody', 'tfoot', 'thead', 'html']);                                          // 328
    }                                                                                                                 // 329
                                                                                                                      // 330
    function clear_stack_to_table_row_context() {                                                                     // 331
        clear_stack_to_context_by_tags(['tr', 'html']);                                                               // 332
    }                                                                                                                 // 333
                                                                                                                      // 334
    function clear_stack_to_context_by_tags(tags) {                                                                   // 335
        while (!_.contains(tags, current_node().name)) {                                                              // 336
            stack.pop();                                                                                              // 337
        }                                                                                                             // 338
    }                                                                                                                 // 339
                                                                                                                      // 340
    function clear_active_elements_to_last_marker() {                                                                 // 341
        var entry;                                                                                                    // 342
        do {                                                                                                          // 343
            entry = active_elements.pop();                                                                            // 344
        } while (!scope_markers[entry.name]);                                                                         // 345
    }                                                                                                                 // 346
                                                                                                                      // 347
    function reset_insertion_mode() {                                                                                 // 348
        var last = false;                                                                                             // 349
        var node;                                                                                                     // 350
        for (var i = stack.length - 1; i >= 0; i--) {                                                                 // 351
            node = stack[i];                                                                                          // 352
            if (node === stack[0]) {                                                                                  // 353
                last = true;                                                                                          // 354
            }                                                                                                         // 355
            switch (node.name) {                                                                                      // 356
                case 'th':                                                                                            // 357
                case 'td':                                                                                            // 358
                    if (!last) {                                                                                      // 359
                        insertion_mode = InCell;                                                                      // 360
                        return;                                                                                       // 361
                    }                                                                                                 // 362
                case 'tr':                                                                                            // 363
                    insertion_mode = InRow;                                                                           // 364
                    return;                                                                                           // 365
                case 'tbody':                                                                                         // 366
                case 'thead':                                                                                         // 367
                case 'tfoot':                                                                                         // 368
                    insertion_mode = InTableBody;                                                                     // 369
                    return;                                                                                           // 370
                case 'caption':                                                                                       // 371
                    insertion_mode = InCaption;                                                                       // 372
                    return;                                                                                           // 373
                case 'colgroup':                                                                                      // 374
                    insertion_mode = InColumnGroup;                                                                   // 375
                    return;                                                                                           // 376
                case 'table':                                                                                         // 377
                    insertion_mode = InTable;                                                                         // 378
                    return;                                                                                           // 379
                default:                                                                                              // 380
                    if (last) {                                                                                       // 381
                        insertion_mode = InBody;                                                                      // 382
                        return;                                                                                       // 383
                    }                                                                                                 // 384
            }                                                                                                         // 385
        }                                                                                                             // 386
    }                                                                                                                 // 387
                                                                                                                      // 388
    function close_the_cell() {                                                                                       // 389
        if (in_table_scope('td')) {                                                                                   // 390
            end('td');                                                                                                // 391
        } else {                                                                                                      // 392
            end('th');                                                                                                // 393
        }                                                                                                             // 394
    }                                                                                                                 // 395
                                                                                                                      // 396
    function start(tagName, attrs, unary) {                                                                           // 397
        insertion_mode.insertion_mode_start(tagName, attrs, unary);                                                   // 398
    }                                                                                                                 // 399
                                                                                                                      // 400
    function end(tagName) {                                                                                           // 401
        insertion_mode.insertion_mode_end(tagName);                                                                   // 402
    }                                                                                                                 // 403
                                                                                                                      // 404
    function chars(text) {                                                                                            // 405
        if (typeof(text) === 'undefined') {                                                                           // 406
            return;                                                                                                   // 407
        }                                                                                                             // 408
        text = noTextManhandle? text : text.replace(/\n\s*\n\s*\n*/g, '\n\n').replace(/(^\n\n|\n\n$)/g, '');          // 409
        text = !encodeHtmlEntities? text : text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        var paragraphs = text.split('\n\n');                                                                          // 411
        var trimmedText;                                                                                              // 412
        if (paragraphs.length > 1) {                                                                                  // 413
            for (var i in paragraphs) {                                                                               // 414
                start('p');                                                                                           // 415
                reconstruct_the_active_formatting_elements();                                                         // 416
                trimmedText = trim_to_1_space(paragraphs[i]);                                                         // 417
                current_node().appendChild(new TextNode(trimmedText));                                                // 418
                end('p');                                                                                             // 419
            }                                                                                                         // 420
        } else {                                                                                                      // 421
            if (text.match(/^\s*$/g) && current_node().children.length && current_node().lastChild().name === 'br') { // 422
                return;                                                                                               // 423
            }                                                                                                         // 424
            reconstruct_the_active_formatting_elements();                                                             // 425
            trimmedText = trim_to_1_space(paragraphs[0]);                                                             // 426
            current_node().appendChild(new TextNode(trimmedText));                                                    // 427
        }                                                                                                             // 428
    }                                                                                                                 // 429
                                                                                                                      // 430
    var InBody = {                                                                                                    // 431
        insertion_mode_start: function (tagName, attrs) {                                                             // 432
            var node;                                                                                                 // 433
            tagName = tagName.toLowerCase();                                                                          // 434
            if (withoutTags[tagName]) {                                                                               // 435
                return;                                                                                               // 436
            }                                                                                                         // 437
            if (preferStrong_Em) {                                                                                    // 438
                switch (tagName) {                                                                                    // 439
                    case 'b':                                                                                         // 440
                        start('strong');                                                                              // 441
                        return;                                                                                       // 442
                    case 'i':                                                                                         // 443
                        start('em');                                                                                  // 444
                        return;                                                                                       // 445
                }                                                                                                     // 446
            } else if (preferB_I) {                                                                                   // 447
                switch (tagName) {                                                                                    // 448
                    case 'strong':                                                                                    // 449
                        start('b');                                                                                   // 450
                        return;                                                                                       // 451
                    case 'em':                                                                                        // 452
                        start('i');                                                                                   // 453
                        return;                                                                                       // 454
                }                                                                                                     // 455
            }                                                                                                         // 456
            switch (tagName) {                                                                                        // 457
                case 'h1':                                                                                            // 458
                case 'h2':                                                                                            // 459
                case 'h3':                                                                                            // 460
                case 'h4':                                                                                            // 461
                case 'h5':                                                                                            // 462
                case 'h6':                                                                                            // 463
                case 'h7':                                                                                            // 464
                    if (!allowHeaders) {                                                                              // 465
                        start('p');                                                                                   // 466
                        if (preferB_I) {                                                                              // 467
                            start('b');                                                                               // 468
                        } else {                                                                                      // 469
                            start('strong');                                                                          // 470
                        }                                                                                             // 471
                        return;                                                                                       // 472
                    }                                                                                                 // 473
                case 'blockquote':                                                                                    // 474
                case 'ol':                                                                                            // 475
                case 'p':                                                                                             // 476
                case 'ul':                                                                                            // 477
                case 'pre': // Techically PRE shouldn't be in this groups, since newlines should be ignored after a pre tag
                    if (in_scope('p')) {                                                                              // 479
                        end('p');                                                                                     // 480
                    }                                                                                                 // 481
                    insert_html_element_for(tagName, attrs);                                                          // 482
                    return;                                                                                           // 483
                case 'li':                                                                                            // 484
                    if (in_scope('p')) {                                                                              // 485
                        end('p');                                                                                     // 486
                    }                                                                                                 // 487
                    node = current_node();                                                                            // 488
                    while (node.name === 'li') {                                                                      // 489
                        stack.pop();                                                                                  // 490
                    }                                                                                                 // 491
                    insert_html_element_for(tagName, attrs);                                                          // 492
                    return;                                                                                           // 493
                case 'a':                                                                                             // 494
                    for (var i = active_elements.length; i > 0; i--) {                                                // 495
                        if (active_elements[i - 1].name === 'a') {                                                    // 496
                            end('a');                                                                                 // 497
                            active_elements.splice(i - 1, 1);                                                         // 498
                        }                                                                                             // 499
                    }                                                                                                 // 500
                    reconstruct_the_active_formatting_elements();                                                     // 501
                    node = insert_html_element_for(tagName, attrs);                                                   // 502
                    active_elements.push(node);                                                                       // 503
                    return;                                                                                           // 504
                case 'strong':                                                                                        // 505
                case 'b':                                                                                             // 506
                case 'em':                                                                                            // 507
                case 'i':                                                                                             // 508
                case 'u':                                                                                             // 509
                case 'span':                                                                                          // 510
                    reconstruct_the_active_formatting_elements();                                                     // 511
                    node = insert_html_element_for(tagName, attrs);                                                   // 512
                    active_elements.push(node);                                                                       // 513
                    return;                                                                                           // 514
                case 'table':                                                                                         // 515
                    if (in_scope('p')) {                                                                              // 516
                        end('p');                                                                                     // 517
                    }                                                                                                 // 518
                    insert_html_element_for(tagName, attrs);                                                          // 519
                    insertion_mode = InTable;                                                                         // 520
                    return;                                                                                           // 521
                case 'br':                                                                                            // 522
                case 'img':                                                                                           // 523
                    reconstruct_the_active_formatting_elements();                                                     // 524
                    insert_html_element_for(tagName, attrs);                                                          // 525
                    stack.pop();                                                                                      // 526
                    return;                                                                                           // 527
            }                                                                                                         // 528
            if (customTags[tagName]) {                                                                                // 529
                if (selfClosing[tagName]) {                                                                           // 530
                    reconstruct_the_active_formatting_elements();                                                     // 531
                    insert_html_element_for(tagName, attrs);                                                          // 532
                    stack.pop();                                                                                      // 533
                    return;                                                                                           // 534
                } else {                                                                                              // 535
                    reconstruct_the_active_formatting_elements();                                                     // 536
                    node = insert_html_element_for(tagName, attrs);                                                   // 537
                    active_elements.push(node);                                                                       // 538
                    return;                                                                                           // 539
                }                                                                                                     // 540
            }                                                                                                         // 541
        },                                                                                                            // 542
                                                                                                                      // 543
        insertion_mode_end: function (tagName) {                                                                      // 544
            if (typeof tagName === 'undefined') {                                                                     // 545
                return;                                                                                               // 546
            }                                                                                                         // 547
            var node;                                                                                                 // 548
            tagName = tagName.toLowerCase();                                                                          // 549
            if (!withoutTags[tagName]) {                                                                              // 550
                if (preferStrong_Em) {                                                                                // 551
                    switch (tagName) {                                                                                // 552
                        case 'b':                                                                                     // 553
                            end('strong');                                                                            // 554
                            return;                                                                                   // 555
                        case 'i':                                                                                     // 556
                            end('em');                                                                                // 557
                            return;                                                                                   // 558
                    }                                                                                                 // 559
                } else if (preferB_I) {                                                                               // 560
                    switch (tagName) {                                                                                // 561
                        case 'strong':                                                                                // 562
                            end('b');                                                                                 // 563
                            return;                                                                                   // 564
                        case 'em':                                                                                    // 565
                            end('i');                                                                                 // 566
                            return;                                                                                   // 567
                    }                                                                                                 // 568
                }                                                                                                     // 569
                switch (tagName) {                                                                                    // 570
                    case 'h1':                                                                                        // 571
                    case 'h2':                                                                                        // 572
                    case 'h3':                                                                                        // 573
                    case 'h4':                                                                                        // 574
                    case 'h5':                                                                                        // 575
                    case 'h6':                                                                                        // 576
                    case 'h7':                                                                                        // 577
                        if (!allowHeaders) {                                                                          // 578
                            if (preferB_I) {                                                                          // 579
                                end('b');                                                                             // 580
                            } else {                                                                                  // 581
                                end('strong');                                                                        // 582
                            }                                                                                         // 583
                            end('p');                                                                                 // 584
                            return;                                                                                   // 585
                        }                                                                                             // 586
                        if (in_scope(tagName)) {                                                                      // 587
                            generate_implied_end_tags();                                                              // 588
                            do {                                                                                      // 589
                                node = stack.pop();                                                                   // 590
                            } while (node.name !== tagName);                                                          // 591
                        }                                                                                             // 592
                        return;                                                                                       // 593
                    case 'blockquote':                                                                                // 594
                    case 'ol':                                                                                        // 595
                    case 'ul':                                                                                        // 596
                    case 'pre': // Techically PRE shouldn't be in this groups, since newlines should be ignored after a pre tag
                        if (in_scope(tagName)) {                                                                      // 598
                            generate_implied_end_tags();                                                              // 599
                        }                                                                                             // 600
                        if (in_scope(tagName)) {                                                                      // 601
                            do {                                                                                      // 602
                                node = stack.pop();                                                                   // 603
                            } while (node.name !== tagName);                                                          // 604
                        }                                                                                             // 605
                        return;                                                                                       // 606
                    case 'p':                                                                                         // 607
                        if (in_scope(tagName)) {                                                                      // 608
                            generate_implied_end_tags(tagName);                                                       // 609
                        }                                                                                             // 610
                        var no_p_in_scope = true;                                                                     // 611
                        while (in_scope(tagName)) {                                                                   // 612
                            no_p_in_scope = false;                                                                    // 613
                            node = stack.pop();                                                                       // 614
                        }                                                                                             // 615
                        if (no_p_in_scope) {                                                                          // 616
                            start('p', [], false);                                                                    // 617
                            end('p');                                                                                 // 618
                        }                                                                                             // 619
                        return;                                                                                       // 620
                    case 'li':                                                                                        // 621
                        if (in_scope(tagName)) {                                                                      // 622
                            generate_implied_end_tags(tagName);                                                       // 623
                        }                                                                                             // 624
                        if (in_scope(tagName)) {                                                                      // 625
                            do {                                                                                      // 626
                                node = stack.pop();                                                                   // 627
                            } while (node.name !== tagName);                                                          // 628
                        }                                                                                             // 629
                        return;                                                                                       // 630
                    case 'a':                                                                                         // 631
                    case 'i':                                                                                         // 632
                    case 'em':                                                                                        // 633
                    case 'strong':                                                                                    // 634
                    case 'b':                                                                                         // 635
                    case 'u':                                                                                         // 636
                    case 'span':                                                                                      // 637
                        for (var i = active_elements.length; i > 0; i--) {                                            // 638
                            if (active_elements[i - 1].name === tagName) {                                            // 639
                                node = active_elements[i - 1];                                                        // 640
                                break;                                                                                // 641
                            }                                                                                         // 642
                        }                                                                                             // 643
                        if (typeof(node) === 'undefined' || !_.contains(stack, node)) {                               // 644
                            return;                                                                                   // 645
                        }                                                                                             // 646
                        // Step 2 from the algorithm in the HTML5 spec will never be necessary with the tags we allow // 647
                        var popped_node;                                                                              // 648
                        do {                                                                                          // 649
                            popped_node = stack.pop();                                                                // 650
                        } while (popped_node !== node);                                                               // 651
                        active_elements.splice(i - 1, 1);                                                             // 652
                        return;                                                                                       // 653
                                                                                                                      // 654
                }                                                                                                     // 655
                if (customTags[tagName] && !selfClosing[tagName]) {                                                   // 656
                    for (var i = active_elements.length; i > 0; i--) {                                                // 657
                        if (active_elements[i - 1].name === tagName) {                                                // 658
                            node = active_elements[i - 1];                                                            // 659
                            break;                                                                                    // 660
                        }                                                                                             // 661
                    }                                                                                                 // 662
                    if (typeof(node) === 'undefined' || !_.contains(stack, node)) {                                   // 663
                        return;                                                                                       // 664
                    }                                                                                                 // 665
                    // Step 2 from the algorithm in the HTML5 spec will never be necessary with the tags we allow     // 666
                    var popped_node;                                                                                  // 667
                    do {                                                                                              // 668
                        popped_node = stack.pop();                                                                    // 669
                    } while (popped_node !== node);                                                                   // 670
                    active_elements.splice(i - 1, 1);                                                                 // 671
                    return;                                                                                           // 672
                }                                                                                                     // 673
            }                                                                                                         // 674
            node = current_node();                                                                                    // 675
            if (node.name === tagName) {                                                                              // 676
                generate_implied_end_tags();                                                                          // 677
                while (stack.length > 0 && node !== current_node()) {                                                 // 678
                    stack.pop();                                                                                      // 679
                }                                                                                                     // 680
            }                                                                                                         // 681
        }                                                                                                             // 682
    };                                                                                                                // 683
                                                                                                                      // 684
    var InTable = {                                                                                                   // 685
        insertion_mode_start: function (tagName, attrs, unary) {                                                      // 686
            tagName = tagName.toLowerCase();                                                                          // 687
            switch (tagName) {                                                                                        // 688
                case 'caption':                                                                                       // 689
                    clear_stack_to_table_context();                                                                   // 690
                    active_elements.push(insert_html_element_for(tagName, attrs));                                    // 691
                    insertion_mode = InCaption;                                                                       // 692
                    return;                                                                                           // 693
                case 'colgroup':                                                                                      // 694
                    clear_stack_to_table_context();                                                                   // 695
                    insert_html_element_for(tagName, attrs);                                                          // 696
                    insertion_mode = InColumnGroup;                                                                   // 697
                    return;                                                                                           // 698
                case 'col':                                                                                           // 699
                    start('colgroup');                                                                                // 700
                    start(tagName, attrs, unary);                                                                     // 701
                    return;                                                                                           // 702
                case 'tbody':                                                                                         // 703
                case 'tfoot':                                                                                         // 704
                case 'thead':                                                                                         // 705
                    clear_stack_to_table_context();                                                                   // 706
                    insert_html_element_for(tagName, attrs);                                                          // 707
                    insertion_mode = InTableBody;                                                                     // 708
                    return;                                                                                           // 709
                case 'td':                                                                                            // 710
                case 'th':                                                                                            // 711
                case 'tr':                                                                                            // 712
                    start('tbody');                                                                                   // 713
                    start(tagName, attrs, unary);                                                                     // 714
                    return;                                                                                           // 715
            }                                                                                                         // 716
        },                                                                                                            // 717
                                                                                                                      // 718
        insertion_mode_end: function (tagName) {                                                                      // 719
            if (typeof(tagName) === undefined) {                                                                      // 720
                return;                                                                                               // 721
            }                                                                                                         // 722
            tagName = tagName.toLowerCase();                                                                          // 723
            switch (tagName) {                                                                                        // 724
                case 'table':                                                                                         // 725
                    if (in_table_scope('table')) {                                                                    // 726
                        var node;                                                                                     // 727
                        do {                                                                                          // 728
                            node = stack.pop();                                                                       // 729
                        } while (node.name !== 'table');                                                              // 730
                    }                                                                                                 // 731
                    reset_insertion_mode();                                                                           // 732
                    return;                                                                                           // 733
            }                                                                                                         // 734
        }                                                                                                             // 735
    };                                                                                                                // 736
                                                                                                                      // 737
    var InCaption = {                                                                                                 // 738
        insertion_mode_start: function (tagName, attrs, unary) {                                                      // 739
            tagName = tagName.toLowerCase();                                                                          // 740
            switch (tagName) {                                                                                        // 741
                case 'caption':                                                                                       // 742
                case 'col':                                                                                           // 743
                case 'colgroup':                                                                                      // 744
                case 'tbody':                                                                                         // 745
                case 'td':                                                                                            // 746
                case 'tfoot':                                                                                         // 747
                case 'th':                                                                                            // 748
                case 'thead':                                                                                         // 749
                case 'tr':                                                                                            // 750
                    end('caption');                                                                                   // 751
                    start(tagName);                                                                                   // 752
                    return;                                                                                           // 753
                default:                                                                                              // 754
                    InBody.insertion_mode_start(tagName, attrs, unary);                                               // 755
                    return;                                                                                           // 756
            }                                                                                                         // 757
        },                                                                                                            // 758
                                                                                                                      // 759
        insertion_mode_end: function (tagName) {                                                                      // 760
            if (typeof(tagName) === undefined) {                                                                      // 761
                return;                                                                                               // 762
            }                                                                                                         // 763
            tagName = tagName.toLowerCase();                                                                          // 764
            switch (tagName) {                                                                                        // 765
                case 'caption':                                                                                       // 766
                    if (in_table_scope('caption')) {                                                                  // 767
                        generate_implied_end_tags();                                                                  // 768
                        if (current_node().name === 'caption') {                                                      // 769
                            var node;                                                                                 // 770
                            do {                                                                                      // 771
                                node = stack.pop();                                                                   // 772
                            } while (node.name !== 'caption');                                                        // 773
                            clear_active_elements_to_last_marker();                                                   // 774
                            insertion_mode = InTable;                                                                 // 775
                        }                                                                                             // 776
                    }                                                                                                 // 777
                    return;                                                                                           // 778
                case "body":                                                                                          // 779
                case "col":                                                                                           // 780
                case "colgroup":                                                                                      // 781
                case "html":                                                                                          // 782
                case "tbody":                                                                                         // 783
                case "td":                                                                                            // 784
                case "tfoot":                                                                                         // 785
                case "th":                                                                                            // 786
                case "thead":                                                                                         // 787
                case "tr":                                                                                            // 788
                    return;                                                                                           // 789
                case 'table':                                                                                         // 790
                    end('caption');                                                                                   // 791
                    end('table');                                                                                     // 792
                    return;                                                                                           // 793
                default:                                                                                              // 794
                    InBody.insertion_mode_end(tagName);                                                               // 795
                    return;                                                                                           // 796
            }                                                                                                         // 797
        }                                                                                                             // 798
    };                                                                                                                // 799
                                                                                                                      // 800
    var InColumnGroup = {                                                                                             // 801
        insertion_mode_start: function (tagName, attrs, unary) {                                                      // 802
            tagName = tagName.toLowerCase();                                                                          // 803
            switch (tagName) {                                                                                        // 804
                case 'html':                                                                                          // 805
                    InBody.insertion_mode_start(tagName, attrs, unary);                                               // 806
                    return;                                                                                           // 807
                case 'col':                                                                                           // 808
                    insert_html_element_for(tagName, attrs);                                                          // 809
                    stack.pop();                                                                                      // 810
                    return;                                                                                           // 811
                default:                                                                                              // 812
                    end('colgroup');                                                                                  // 813
                    start(tagName);                                                                                   // 814
                    return;                                                                                           // 815
            }                                                                                                         // 816
        },                                                                                                            // 817
                                                                                                                      // 818
        insertion_mode_end: function (tagName) {                                                                      // 819
            if (typeof(tagName) === undefined) {                                                                      // 820
                return;                                                                                               // 821
            }                                                                                                         // 822
            tagName = tagName.toLowerCase();                                                                          // 823
            switch (tagName) {                                                                                        // 824
                case 'colgroup':                                                                                      // 825
                    if (current_node().name !== 'html') {                                                             // 826
                        stack.pop();                                                                                  // 827
                        insertion_mode = InTable;                                                                     // 828
                    }                                                                                                 // 829
                    return;                                                                                           // 830
                case 'col':                                                                                           // 831
                    return;                                                                                           // 832
                default:                                                                                              // 833
                    end('colgroup');                                                                                  // 834
                    end(tagName);                                                                                     // 835
                    return;                                                                                           // 836
            }                                                                                                         // 837
        }                                                                                                             // 838
    };                                                                                                                // 839
                                                                                                                      // 840
    var InTableBody = {                                                                                               // 841
        insertion_mode_start: function (tagName, attrs, unary) {                                                      // 842
            tagName = tagName.toLowerCase();                                                                          // 843
            switch (tagName) {                                                                                        // 844
                case 'tr':                                                                                            // 845
                    clear_stack_to_table_body_context();                                                              // 846
                    insert_html_element_for(tagName, attrs);                                                          // 847
                    insertion_mode = InRow;                                                                           // 848
                    return;                                                                                           // 849
                case 'th':                                                                                            // 850
                case 'td':                                                                                            // 851
                    start('tr');                                                                                      // 852
                    start(tagName, attrs, unary);                                                                     // 853
                    return;                                                                                           // 854
                case "caption":                                                                                       // 855
                case "col":                                                                                           // 856
                case "colgroup":                                                                                      // 857
                case "tbody":                                                                                         // 858
                case "tfoot":                                                                                         // 859
                case "thead":                                                                                         // 860
                    if (in_table_scope('tbody') || in_table_scope('thead') || in_table_scope('tfoot')) {              // 861
                        clear_stack_to_table_body_context();                                                          // 862
                        end(current_node().name);                                                                     // 863
                        start(tagName, attrs, unary);                                                                 // 864
                    }                                                                                                 // 865
                    return;                                                                                           // 866
            }                                                                                                         // 867
        },                                                                                                            // 868
                                                                                                                      // 869
        insertion_mode_end: function (tagName) {                                                                      // 870
            if (typeof(tagName) === undefined) {                                                                      // 871
                return;                                                                                               // 872
            }                                                                                                         // 873
            tagName = tagName.toLowerCase();                                                                          // 874
            switch (tagName) {                                                                                        // 875
                case 'tbody':                                                                                         // 876
                case 'tfoot':                                                                                         // 877
                case 'thead':                                                                                         // 878
                    if (in_table_scope(tagName)) {                                                                    // 879
                        clear_stack_to_table_body_context();                                                          // 880
                        stack.pop();                                                                                  // 881
                        insertion_mode = InTable;                                                                     // 882
                    }                                                                                                 // 883
                    return;                                                                                           // 884
                case 'table':                                                                                         // 885
                    if (in_table_scope('tbody') || in_table_scope('thead') || in_table_scope('tfoot')) {              // 886
                        clear_stack_to_table_body_context();                                                          // 887
                        end(current_node().name);                                                                     // 888
                        end(tagName);                                                                                 // 889
                    }                                                                                                 // 890
                    return;                                                                                           // 891
                case "body":                                                                                          // 892
                case "caption":                                                                                       // 893
                case "col":                                                                                           // 894
                case "colgroup":                                                                                      // 895
                case "html":                                                                                          // 896
                case "td":                                                                                            // 897
                case "th":                                                                                            // 898
                case "tr":                                                                                            // 899
                    return;                                                                                           // 900
                default:                                                                                              // 901
                    InTable.insertion_mode_end(tagName);                                                              // 902
                    return;                                                                                           // 903
            }                                                                                                         // 904
        }                                                                                                             // 905
    };                                                                                                                // 906
                                                                                                                      // 907
    var InRow = {                                                                                                     // 908
        insertion_mode_start: function (tagName, attrs, unary) {                                                      // 909
            tagName = tagName.toLowerCase();                                                                          // 910
            switch (tagName) {                                                                                        // 911
                case 'th':                                                                                            // 912
                case 'td':                                                                                            // 913
                    clear_stack_to_table_row_context();                                                               // 914
                    var node = insert_html_element_for(tagName, attrs);                                               // 915
                    insertion_mode = InCell;                                                                          // 916
                    active_elements.push(node);                                                                       // 917
                    return;                                                                                           // 918
                case "caption":                                                                                       // 919
                case "col":                                                                                           // 920
                case "colgroup":                                                                                      // 921
                case "tbody":                                                                                         // 922
                case "tfoot":                                                                                         // 923
                case "thead":                                                                                         // 924
                case "tr":                                                                                            // 925
                    end('tr');                                                                                        // 926
                    start(tagName, attrs, unary);                                                                     // 927
                    return;                                                                                           // 928
                default:                                                                                              // 929
                    InTable.insertion_mode_start(tagName, attrs, unary);                                              // 930
                    return;                                                                                           // 931
            }                                                                                                         // 932
        },                                                                                                            // 933
                                                                                                                      // 934
        insertion_mode_end: function (tagName) {                                                                      // 935
            if (typeof(tagName) === undefined) {                                                                      // 936
                return;                                                                                               // 937
            }                                                                                                         // 938
            tagName = tagName.toLowerCase();                                                                          // 939
            switch (tagName) {                                                                                        // 940
                case 'tr':                                                                                            // 941
                    if (in_table_scope(tagName)) {                                                                    // 942
                        clear_stack_to_table_row_context();                                                           // 943
                        stack.pop();                                                                                  // 944
                        insertion_mode = InTableBody;                                                                 // 945
                    }                                                                                                 // 946
                    return;                                                                                           // 947
                case 'table':                                                                                         // 948
                    end('tr');                                                                                        // 949
                                                                                                                      // 950
                    // this line was in the original source but attrs/unary are not defined                           // 951
                    // so not sure what to do with it. how was this working?                                          // 952
                    // start(tagName, attrs, unary);                                                                  // 953
                    return;                                                                                           // 954
                case "tbody":                                                                                         // 955
                case "tfoot":                                                                                         // 956
                case "thead":                                                                                         // 957
                    if (in_table_scope(tagName)) {                                                                    // 958
                        end('tr');                                                                                    // 959
                        end(tagName);                                                                                 // 960
                    }                                                                                                 // 961
                    return;                                                                                           // 962
                case "body":                                                                                          // 963
                case "caption":                                                                                       // 964
                case "col":                                                                                           // 965
                case "colgroup":                                                                                      // 966
                case "html":                                                                                          // 967
                case "td":                                                                                            // 968
                case "th":                                                                                            // 969
                    return;                                                                                           // 970
                default:                                                                                              // 971
                    InTable.insertion_mode_end(tagName);                                                              // 972
                    return;                                                                                           // 973
            }                                                                                                         // 974
        }                                                                                                             // 975
    };                                                                                                                // 976
                                                                                                                      // 977
    var InCell = {                                                                                                    // 978
        insertion_mode_start: function (tagName, attrs, unary) {                                                      // 979
            tagName = tagName.toLowerCase();                                                                          // 980
            switch (tagName) {                                                                                        // 981
                case "caption":                                                                                       // 982
                case "col":                                                                                           // 983
                case "colgroup":                                                                                      // 984
                case "tbody":                                                                                         // 985
                case "td":                                                                                            // 986
                case "tfoot":                                                                                         // 987
                case "th":                                                                                            // 988
                case "thead":                                                                                         // 989
                case "tr":                                                                                            // 990
                    if (in_table_scope('td') || in_table_scope('th')) {                                               // 991
                        close_the_cell();                                                                             // 992
                        start(tagName, attrs, unary);                                                                 // 993
                    }                                                                                                 // 994
                    return;                                                                                           // 995
                default:                                                                                              // 996
                    InBody.insertion_mode_start(tagName, attrs, unary);                                               // 997
                    return;                                                                                           // 998
            }                                                                                                         // 999
        },                                                                                                            // 1000
                                                                                                                      // 1001
        insertion_mode_end: function (tagName) {                                                                      // 1002
            if (typeof(tagName) === undefined) {                                                                      // 1003
                return;                                                                                               // 1004
            }                                                                                                         // 1005
            tagName = tagName.toLowerCase();                                                                          // 1006
            switch (tagName) {                                                                                        // 1007
                case "td":                                                                                            // 1008
                case "th":                                                                                            // 1009
                    if (in_table_scope(tagName)) {                                                                    // 1010
                        generate_implied_end_tags();                                                                  // 1011
                        if (current_node().name !== tagName) {                                                        // 1012
                            return;                                                                                   // 1013
                        }                                                                                             // 1014
                        var node;                                                                                     // 1015
                        do {                                                                                          // 1016
                            node = stack.pop();                                                                       // 1017
                        } while (node.name !== tagName);                                                              // 1018
                                                                                                                      // 1019
                        clear_active_elements_to_last_marker();                                                       // 1020
                        insertion_mode = InRow;                                                                       // 1021
                    }                                                                                                 // 1022
                    return;                                                                                           // 1023
                case "body":                                                                                          // 1024
                case "caption":                                                                                       // 1025
                case "col":                                                                                           // 1026
                case "colgroup":                                                                                      // 1027
                case "html":                                                                                          // 1028
                    return;                                                                                           // 1029
                case "table":                                                                                         // 1030
                case "tbody":                                                                                         // 1031
                case "tfoot":                                                                                         // 1032
                case "thead":                                                                                         // 1033
                case "tr":                                                                                            // 1034
                    if (in_table_scope(tagName)) {                                                                    // 1035
                        close_the_cell();                                                                             // 1036
                        end(tagName);                                                                                 // 1037
                    }                                                                                                 // 1038
                    return;                                                                                           // 1039
                default:                                                                                              // 1040
                    InBody.insertion_mode_end(tagName);                                                               // 1041
                    return;                                                                                           // 1042
            }                                                                                                         // 1043
        }                                                                                                             // 1044
    };                                                                                                                // 1045
                                                                                                                      // 1046
    init(settings);                                                                                                   // 1047
                                                                                                                      // 1048
    return {                                                                                                          // 1049
        start: start,                                                                                                 // 1050
        end: end,                                                                                                     // 1051
        chars: chars,                                                                                                 // 1052
        getResult: function(){                                                                                        // 1053
            return noTextManhandle? root.innerHTML() : root.innerHTML().replace(/^\s+/, '');                          // 1054
        }                                                                                                             // 1055
    };                                                                                                                // 1056
                                                                                                                      // 1057
};                                                                                                                    // 1058
                                                                                                                      // 1059
                                                                                                                      // 1060
var allowed_attributes = {};                                                                                          // 1061
var customTags = {};                                                                                                  // 1062
var selfClosing = {};                                                                                                 // 1063
                                                                                                                      // 1064
/* global UniHTML: true */                                                                                            // 1065
UniHTML = {                                                                                                           // 1066
    /**                                                                                                               // 1067
     * Parse html string and calls callback in the same order as tags in html string are present.                     // 1068
     * Method supports html5, including custom tags.                                                                  // 1069
     * @param html                                                                                                    // 1070
     * @param handler {Object} object of callbacks for example:                                                       // 1071
     * {                                                                                                              // 1072
     *          // attributesOnTag is an Object like {name, value, escaped}                                           // 1073
     *      start: function(tagName, attributesOnTag, isSelfClosing), // open tag                                     // 1074
     *      end: function(tagName), // close                                                                          // 1075
     *      chars: function(text), // text between open and closing tag                                               // 1076
     *      comment: function(text) // text from comment                                                              // 1077
     * }                                                                                                              // 1078
     * @throws Parse Error                                                                                            // 1079
     */                                                                                                               // 1080
    parse: HTMLParser,                                                                                                // 1081
    /**                                                                                                               // 1082
     * Cleanup dirty html from unknown/untrusted tags                                                                 // 1083
     * @param html {string} html string to purify                                                                     // 1084
     * @param settings {Object} noFormatting, preferStrong_Em, preferB_I, noHeaders, withoutTags                      // 1085
     * @returns {HTML|string|void}                                                                                    // 1086
     */                                                                                                               // 1087
    purify: function (html, settings) {                                                                               // 1088
        if (typeof settings !== 'object') {                                                                           // 1089
            settings = {};                                                                                            // 1090
        }                                                                                                             // 1091
        settings = _.extend({                                                                                         // 1092
            allowed_attributes: allowed_attributes,                                                                   // 1093
            customTags: customTags,                                                                                   // 1094
            selfClosingTags: selfClosing                                                                              // 1095
        }, settings);                                                                                                 // 1096
        var purifierInstance = htmlPurifier(settings);                                                                // 1097
        try {                                                                                                         // 1098
            HTMLParser(html, {                                                                                        // 1099
                start: purifierInstance.start,                                                                        // 1100
                end: purifierInstance.end,                                                                            // 1101
                chars: purifierInstance.chars                                                                         // 1102
            });                                                                                                       // 1103
        } catch (e) {                                                                                                 // 1104
            if (!settings.catchErrors) {                                                                              // 1105
                throw e;                                                                                              // 1106
            }                                                                                                         // 1107
        }                                                                                                             // 1108
        return purifierInstance.getResult();                                                                          // 1109
    },                                                                                                                // 1110
    /**                                                                                                               // 1111
     * Sets new default allowed attributes for one or all tags                                                        // 1112
     * (it can be overridden by setting 'allowed_attributes' in purify)                                               // 1113
     * @param attributesArray {Array} Array of names of attributes                                                    // 1114
     * @param tag {string=} [tag=all_elements]                                                                        // 1115
     */                                                                                                               // 1116
    setNewAllowedAttributes: function (attributesArray, tag) {                                                        // 1117
        if (!tag) {                                                                                                   // 1118
            tag = 'all_elements';                                                                                     // 1119
        }                                                                                                             // 1120
        if (!attributesArray) {                                                                                       // 1121
            attributesArray = [];                                                                                     // 1122
        }                                                                                                             // 1123
        if (typeof attributesArray === 'string') {                                                                    // 1124
            attributesArray = [attributesArray];                                                                      // 1125
        }                                                                                                             // 1126
        allowed_attributes[tag] = attributesArray;                                                                    // 1127
    },                                                                                                                // 1128
    /**                                                                                                               // 1129
     * Adds new default allowed html tag                                                                              // 1130
     * (it can be overridden by settings 'customTags', 'selfClosingTags' in purify method)                            // 1131
     * @param tagName {string}                                                                                        // 1132
     * @param isSelfClosing {boolean=} a void tags like: img, hr, area                                                // 1133
     */                                                                                                               // 1134
    addNewAllowedTag: function (tagName, isSelfClosing) {                                                             // 1135
        customTags[tagName] = true;                                                                                   // 1136
        if (isSelfClosing) {                                                                                          // 1137
            selfClosing[tagName] = true;                                                                              // 1138
        }                                                                                                             // 1139
    }                                                                                                                 // 1140
                                                                                                                      // 1141
};                                                                                                                    // 1142
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['vazco:universe-html-purifier'] = {}, {
  UniHTML: UniHTML
});

})();

//# sourceMappingURL=vazco_universe-html-purifier.js.map
