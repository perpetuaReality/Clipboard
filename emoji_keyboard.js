var URI = "";

//Load the project's directory's URI into a string.
document.baseURI.split("/").slice(0, -1).forEach(function (arg) { URI += arg + "/"; });
//Append the filename of the emoji table ("emoji_test.txt" for normal, "emoji_test_massive.txt" for long loading times) to the URI.
URI += "emoji_test.txt";

//Create a new XMLHttpRequest to read the contents of the emoji table. Make it asyncronous so that the user knows the page is loading.
var txtFile = new XMLHttpRequest();
txtFile.open("GET", URI, false);
txtFile.send(null);

//Once the file has been loaded by the Request, load the list of groups of emojis into an array.
txtFile.onload = loadList();
function loadList() {
    //Make the Loading div visible.
    document.getElementById("loading").style.visibility = "visible";
    var groups = [];

    //Read every line on the file.
    var lines = txtFile.responseText.split("\n");
    lines.forEach(function (line) {
        if (line.startsWith("#")) {
            //If the line defines a group, make a new Group element with a Name attribute and a Subgroups array.
            if (line.startsWith("# group:")) {
                groups.push({
                    name: line.split(": ")[1],
                    subgroups: new Array()
                })
            //If the line defines a subgroup, make a new Subroup element with a Name attribute and an Elements array.
            } else if (line.startsWith("# subgroup:")) {
                groups[groups.length - 1].subgroups.push({
                    name: line.split(": ")[1],
                    elements: new Array()
                })
            }
            //If the line starts with a "#" but doesn't have the "group" or "subgroup" keywords, then ignore it.
        } else {
            if (line != "") {
                //If the line is not empty and doesn't start with an "#", then it defines an emoji.
                //Create an Element group with the Unicode codepoint of every emoji part that defines the overall emoji (base emojis AND modifiers) and a Description.
                var description = "";
                line.split("#")[1].split(" ").slice(2).forEach(function (val) { description += val + " " });
                groups[groups.length - 1].subgroups[groups[groups.length - 1].subgroups.length - 1].elements.push({
                    unicode: line.split(";")[0],
                    desc: description
                })
            }
        }
    });
    //Hide the Loading div and return the Groups List.
    document.getElementById("loading").style.visibility = "hidden";
    return groups;
}

//Get the global Groups List from the loadList function.
var groups = loadList();

//Generate the Keyboard from the Groups List.
function generateKeyboard() {
    var gTitleHeight = 40;
    var sgTitleHeight = 30;

    //Make the Loading div visible.
    document.getElementById("loading").style.visibility = "visible";
    
    groups.forEach(function (group) {
        //Create a Group Panel with a Title Bar at the top, for each Group available.
        var title = document.createElement("div");
        var gPanel = document.createElement("div");
        title.className = "group_title";
        //Add an id attribute to the Title Bar so that it can be accessed through the Index.
        title.id = "g:" + group.name;

        //Add a button to contract or expand the Group Panel at the beginning of the Title Bar.
        var toggleBtn = document.createElement("button");
        toggleBtn.onclick = function () { contractPanel(toggleBtn, gPanel, gTitleHeight) };
        toggleBtn.innerText = "[-]";
        title.appendChild(toggleBtn);
        //After the Button, write the name of the Group.
        title.appendChild(document.createTextNode("Group: " + group.name));

        //Apply the class of the Panel and append the Title Bar to it.
        gPanel.className = "group_panel"
        gPanel.appendChild(title);
        
        group.subgroups.forEach(function (subgroup) {
            //Create a Subgroup Panel with a Title Bar at the top, for each of the current Group's Subgroups.
            var title = document.createElement("div");
            var sgPanel = document.createElement("div");
            title.className = "subgroup_title";
            //Add an id attribute to the Title Bar so that it can be accessed through the Index.
            title.id = "sg:" + subgroup.name;

            //Add a button to contract or expand the Subgroup Panel at the beginning of the Title Bar.
            var toggleBtn = document.createElement("button");
            toggleBtn.onclick = function () { contractPanel(toggleBtn, sgPanel, sgTitleHeight) };
            toggleBtn.innerText = "[-]";
            title.appendChild(toggleBtn);
            //After the Button, write the name of the Subgroup.
            title.appendChild(document.createTextNode("Subgroup: " + subgroup.name));

            //Apply the class of the Panel and append the Title Bar to it.
            sgPanel.className = "subgroup_panel"
            sgPanel.appendChild(title);

            subgroup.elements.forEach(function (emoji) {
                //Load each Inner Emoji from each Emoji Element by reading it's Unicode Codepoint from the file and storing the resulting characters into an array.
                var emojiParts = [];
                emoji.unicode.split(" ").forEach(function (val) { if (val != "") emojiParts.push(String.fromCodePoint("0x" + val)); });

                //Create the Emoji Button with the corresponding Emoji printed into it.
                var btn = document.createElement("button");
                var text = "";
                emojiParts.forEach(function (val) { text += val });
                var t = document.createTextNode(text);
                btn.appendChild(t);
                //Upon mousing over the Button, show the Tooltip with the info of the current Emoji. Hide it once the mouse moves away.
                btn.onmouseover = function () { showTooltip(btn, emoji, emojiParts) };
                btn.onmouseout = function () { document.getElementById("emoji_tooltip").style.visibility = "hidden" };
                //Upon clicking the button, copy the Emoji to the system's clipboard.
                btn.addEventListener("click", function (event) {
                    var title = document.querySelector("input[class='emoji_title']");
                    title.select();
                    document.execCommand("Copy");
                    title.deselect();
                })

                //Append the Emoji Button.
                sgPanel.appendChild(btn);
            })

            //Append the Subgroup Panel.
            gPanel.appendChild(sgPanel);
        })

        //Append the Group Panel.
        document.getElementById("emoji_kb").appendChild(gPanel);
    })
    //Hide the Loading div.
    document.getElementById("loading").style.visibility = "hidden";
}

function generateGroupTree() {
    //Make the Loading div visible.
    document.getElementById("loading").style.visibility = "visible";

    //Create the Tree Element.
    var gList = document.createElement("ul");
    groups.forEach(function (group) {
        //For each Group, create a new List Item that links to the position of the corresponding Panel on the document.
        var gItem = document.createElement("li");
        gItem.innerHTML = "<a href='#g:" + group.name + "'>" + group.name + "</a>";
        //Apply the Item's class and make a new List out of it. I.e. make a Branch.
        gItem.className = "gTree_group";
        var sgList = document.createElement("ul");

        group.subgroups.forEach(function (subgroup) {
            //For each Subgroup on the current Group, create a new List Item that links to the position of the corresponding Panel on the document.
            var sgItem = document.createElement("li");
            sgItem.innerHTML = "<a href='#sg:" + subgroup.name + "'>" + subgroup.name + "</a>";
            //Apply the Item's class.
            sgItem.className = "gTree_subgroup";

            //Append the Subgroup Item to the Subgroup Branch Element.
            sgList.appendChild(sgItem);
        })
        //Append the Group Item to the Tree Element.
        gList.appendChild(gItem);
        //Append the Subgroup Branch to the Tree Element.
        gList.appendChild(sgList);

        //Place the Tree Element to the Index.
        document.getElementById("index").appendChild(gList);
    })
    //Hide the Loading div.
    document.getElementById("loading").style.visibility = "hidden";
}
generateKeyboard();
generateGroupTree();

function showTooltip(caller, emojiData, emoji) {
    var minTop = 120;
    var minLeft = 175;

    //Show the Tooltip.
    document.getElementById("emoji_tooltip").style.visibility = "visible";

    var btnPos = caller.getBoundingClientRect();
    //If the Tooltip has enough room above it, show it above the Emoji Button that called it. Otherwise, show it below.
    if (btnPos.top > minTop) {
        document.getElementById("emoji_tooltip").style.top = btnPos.top - minTop;
    } else {
        document.getElementById("emoji_tooltip").style.top = btnPos.top + btnPos.height;
    }
    //If the Tooltip has enough room to the left and to the right, show it centered above/below the Emoji Button that called it. Otherwise, move it around so that it fits.
    if (btnPos.left < minLeft || btnPos.right < minLeft) {
        if (btnPos.left < minLeft) {
            document.getElementById("emoji_tooltip").style.left = btnPos.left;
        } else if (btnPos.right < minLeft) {
            document.getElementById("emoji_tooltip").style.left = btnPos.left - minLeft + btnPos.width;
        }
    } else {
        document.getElementById("emoji_tooltip").style.left = btnPos.left + btnPos.width/2 - minLeft;
    }

    //Show the Emoji and its info on the Tooltip.
    var title = "<div class=\"emoji_title\"><input class=\"emoji_title\" style='text-align: center; width: 60px;' value='";
    emoji.forEach(function (val) { title += val }); //Write each of the Emoji's Elements into the Tooltip.
    title += "'></input> " + emojiData.desc + "</div>";
    document.getElementById("emoji_tooltip").innerHTML = title;
}

//ACCORDION LOGIC
function contractPanel(caller, panel, titleHeight) {
    caller.onclick = function () { expandPanel(caller, panel, titleHeight) };
    caller.innerText = "[+]"
    panel.style.height = titleHeight;
}

function expandPanel(caller, panel, titleHeight) {
    caller.onclick = function () { contractPanel(caller, panel, titleHeight) };
    caller.innerText = "[-]"
    panel.style.height = "auto";
}

function toggleIndex() {
    var index = document.getElementById("index");
    var toggleBtn = document.getElementById("toggleIndex");
    //If the Index is contracted, expand it.
    if (index.style.height === "0px") {
        index.style.height = "auto";
        toggleBtn.innerText = "Hide index";
    } else {
        index.style.height = "0px";
        toggleBtn.innerText = "Show index";
    }
}

console.log(groups[3].subgroups[0].elements[4].desc); //MUST PRINT "WORLD MAP"