window.onload = init

function init() {
    let stateSelection = document.getElementById("state")
    for (let stateAbbr in stateMapping) {
        let option = new Option(stateMapping[stateAbbr], stateAbbr)
        stateSelection.appendChild(option)
    }
}

function submitAddress() {
    let autoDetection = document.getElementById("auto-detect").checked
    if (autoDetection) {

    } else {
        let addressForm = document.getElementById("address-form")
        if (addressForm.reportValidity()) {
            let formData = new FormData(document.getElementById("address-form"))
            let searchParam = new URLSearchParams();
            for (let entry of formData.entries()) {
                searchParam.set(entry[0], entry[1])
            }
            let xhr = new XMLHttpRequest();
            console.log(searchParam.toString())
            xhr.open("GET", "/weather?" + searchParam.toString());
            xhr.onload = function (event) {
                console.log(event.target.response)
            };
            xhr.send();
        } else {
            console.log("false")
        }
    }
}

var stateMapping = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
}