var URI = "";

document.baseURI.split("/").slice(0, -1).forEach(function(arg) {URI += arg + "/";});
URI += "emoji_test_massive.txt";

var txtFile = new XMLHttpRequest();
txtFile.open("GET", URI, false);
txtFile.send(null);

txtFile.onload = loadList();
function loadList() {
    document.getElementById("loading").style.visibility = "visible";
    var groups = [];
    var lines = txtFile.responseText.split("\n");
    lines.forEach(function (line) {
        if (line.startsWith("#")) {
            if (line.startsWith("# group:")) {
                groups.push({
                    name: line.split(": ")[1],
                    subgroups: new Array()
                })
            } else if (line.startsWith("# subgroup:")) {
                groups[groups.length - 1].subgroups.push({
                    name: line.split(": ")[1],
                    elements: new Array()
                })
            }
        } else {
            if (line != "") {
                var description = "";
                line.split("#")[1].split(" ").slice(2).forEach(function (val) { description += val + " " });
                groups[groups.length - 1].subgroups[groups[groups.length - 1].subgroups.length - 1].elements.push({
                    unicode: line.split(";")[0],
                    desc: description
                })
            }
        }
    });
    document.getElementById("loading").style.visibility = "hidden";
    return groups;
}

var groups = loadList();

function generateKeyboard() {
    document.getElementById("loading").style.visibility = "visible";

    groups.forEach(function (group) {
        var title = document.createElement("div");
        var gPanel = document.createElement("div");
        title.className = "group_title";
        title.id = "g:" + group.name;
        title.innerText = "Group: " + group.name;
        gPanel.className = "group_panel"
        gPanel.appendChild(title);

        group.subgroups.forEach(function (subgroup) {
            var title = document.createElement("div");
            var sgPanel = document.createElement("div");
            title.className = "subgroup_title";
            title.id = "sg:" + subgroup.name;
            //ADD THE TOGGLE BUTTON AS A JS-DECLARED OBJECT!
            title.innerHTML = "<a href='javascript:contractPanel(this, sgPanel, 30);'>[-]</a> " + "Subgroup: " + subgroup.name;
            sgPanel.className = "subgroup_panel"
            sgPanel.appendChild(title);
            document.body.appendChild(sgPanel);

            subgroup.elements.forEach(function (emoji) {
                var emojiParts = [];
                emoji.unicode.split(" ").forEach(function (val) { if (val != "") emojiParts.push(String.fromCodePoint("0x" + val)); });

                var btn = document.createElement("BUTTON");
                btn.onmouseover = function () { showTooltip(btn, emoji, emojiParts) };
                btn.onmouseout = function () { document.getElementById("emoji_tooltip").style.visibility = "hidden" };
                btn.addEventListener("click", function (event) {
                    var title = document.querySelector("input[class='emoji_title']");
                    title.select();
                    document.execCommand("Copy");
                    title.deselect();
                })
                var text = "";
                emojiParts.forEach(function (val) { text += val });
                var t = document.createTextNode(text);
                btn.appendChild(t);

                sgPanel.appendChild(btn);
            })

            gPanel.appendChild(sgPanel);
        })

        document.getElementById("emoji_kb").appendChild(gPanel);
    })
    document.getElementById("loading").style.visibility = "hidden";
}

function generateGroupTree() {
    document.getElementById("loading").style.visibility = "visible";
    
    var gList = document.createElement("ul");
    groups.forEach(function (group) {
        var gItem = document.createElement("li");
        gItem.innerHTML = "<a href='#g:" + group.name + "'>" + group.name + "</a>";
        gItem.className = "gTree_group";
        var sgList = document.createElement("ul");

        group.subgroups.forEach(function (subgroup) {
            var sgItem = document.createElement("li");
            sgItem.innerHTML = "<a href='#sg:" + subgroup.name + "'>" + subgroup.name + "</a>";
            sgItem.className = "gTree_subgroup";

            sgList.appendChild(sgItem);
        })
        gList.appendChild(gItem);
        gList.appendChild(sgList);

        document.getElementById("emoji_set").appendChild(gList);
    })
    document.getElementById("loading").style.visibility = "hidden";
}
generateKeyboard();
generateGroupTree();

function showTooltip(caller, emojiData, emoji) {
    document.getElementById("emoji_tooltip").style.visibility = "visible";
    var btnPos = caller.getBoundingClientRect();
    if (btnPos.top > 120) {
        document.getElementById("emoji_tooltip").style.top = btnPos.top - 120;
    } else {
        document.getElementById("emoji_tooltip").style.top = btnPos.top + btnPos.height;
    }
    if (btnPos.left < 175 || btnPos.right < 175) {
        if (btnPos.left < 175) {
            document.getElementById("emoji_tooltip").style.left = btnPos.left;
        } else if (btnPos.right < 175) {
            document.getElementById("emoji_tooltip").style.left = btnPos.left - 175 + btnPos.width;
        }
    } else {
        document.getElementById("emoji_tooltip").style.left = btnPos.left + btnPos.width/2 - 175;
    }
    var title = "<div class=\"emoji_title\"><input class=\"emoji_title\" style='text-align: center; width: 60px;' value='";
    emoji.forEach(function (val) { title += val });
    title += "'></input> " + emojiData.desc + "</div>";
    document.getElementById("emoji_tooltip").innerHTML = title;
}

function contractPanel() {
    alert("hi");
    caller.href = "javascript:expandPanel(" + caller + ", " + panel + ", " + titleHeight + ");";
    caller.innerText = "[+]"
    panel.style.height = titleHeight;
}

function expandPanel(caller, panel, titleHeight) {
    caller.onclick = function () { contractPanel(caller, panel, titleHeight) };
    caller.innerText = "[-]"
    panel.style.height = auto;
}

console.log(groups[3].subgroups[0].elements[4].desc); //MUST PRINT "WORLD MAP"