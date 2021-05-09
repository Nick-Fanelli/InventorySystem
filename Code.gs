/*
* Change the following spreadsheet ID varibale to your spreadsheet ID.
* This can be found in the URL of the spreadsheet.
* It will come before and after a slash.
*
* Important: Make sure you leave in the quotes around the spreadsheet ID!!!!
*/
const spreadSheetID = "1ft2yHXjrCviVjBk1ZoIvOgl3YSZ4iCEkEHgNMG1eWsc";

const fullSheet = SpreadsheetApp.openById(spreadSheetID);

function loadJsonPartsData() {
  let inventorySheet = fullSheet.getSheetByName("Inventory");

  let headers = inventorySheet.getRange(1, 1, 1, inventorySheet.getLastColumn()).getValues();

  let itemNameIndex = null;
  let quantityIndex = null;
  let skuIndex = null;

  headers.forEach(function(value) {
    value.forEach(function(value, index) {
      if(value == "Quantity") quantityIndex = index + 1;  // Offset for spreadsheet api starting at 1
      else if(value == "Item Name") itemNameIndex = index + 1; // Offset for spreadsheet api starting at 1
      else if(value == "SKU") skuIndex = index + 1; // Offset for spreadsheet api starting at 1
    });
  });

  if(itemNameIndex == null || quantityIndex == null) {
      console.error("YO! Either Item name index or Quantity index is null and can't be matched with the spreadsheet!");
  }

  let itemNames = inventorySheet.getRange(2, itemNameIndex, inventorySheet.getLastRow(), 1).getValues();
  itemNames = itemNames.filter(function (el) {
    return el != "";
  });

  let quantities = inventorySheet.getRange(2, quantityIndex, inventorySheet.getLastRow(), 1).getValues();
  quantities = quantities.filter(function (el) {
    return el != "";
  });

  let skus = inventorySheet.getRange(2, skuIndex, inventorySheet.getLastRow(), 1).getValues();
  skus = skus.filter(function (el) {
    return el != "";
  });

  let PartLookup = {};

  for(let i = 0; i < itemNames.length; i++) {
    PartLookup[i + 2] = [itemNames[i].toString(), Number.parseInt(quantities[i].toString()), skus[i].toString()];
  }  

  return JSON.stringify(PartLookup);

}

function updateSpreadsheetWithChangeData(data) {
  const inventorySheet = fullSheet.getSheetByName("Inventory");
  const auditLogSheet = fullSheet.getSheetByName("Audit Log");

  let headers = inventorySheet.getRange(1, 1, 1, inventorySheet.getLastColumn()).getValues();

  let quantityIndex = null;

  headers.forEach(function(value) {
    value.forEach(function(value, index) {
      if(value == "Quantity") quantityIndex = index + 1; // Offset for the spreadsheet api starting at 1
    });
  });

  let quantites = inventorySheet.getRange(2, quantityIndex, inventorySheet.getLastRow(), 1).getValues() 
  quantites = quantites.filter(function (el) {
    return el != ""
  });

  let auditLogRange = auditLogSheet.getRange(2, 1, auditLogSheet.getLastRow(), 1).getValues();
  let currentUser = Session.getActiveUser().getEmail();
  let timestamp = new Date();

  let partCount = 0;

  for(partID in data) {
    let cell = inventorySheet.getRange(Number.parseInt(partID), quantityIndex);
    let currentValue = Number.parseInt(cell.getValue());
    let newValue = currentValue + data[partID];
    cell.setValue(newValue);
    
    if(data[partID] != 0) {
      auditLogRange.forEach(function(value, index) {
        if(value == "") {
          let sku = inventorySheet.getRange(partID, 1).getValue();
          // let change = data[partID] > 0 ? "+" + data[partID] : "-" + data[partID];

          auditLogSheet.getRange(2 + index + partCount, 1).setValue(timestamp.toString());
          auditLogSheet.getRange(2 + index + partCount, 2).setValue(currentUser.toString());
          auditLogSheet.getRange(2 + index + partCount, 3).setValue(sku);
          auditLogSheet.getRange(2 + index + partCount, 4).setValue(data[partID]);

          return;
        }
      });

      partCount++;

    }

  }
}

// Main method that gets called
function doGet() {

  // Get the inventory sheet and member sheet/page on it
  const memberSheet = fullSheet.getSheetByName("Members");

  // Get a list of allowed emails from the memberSheet
  let allowedEmails = memberSheet.getRange(2, 1, memberSheet.getLastRow(), 1).getValues();

  // Get the current email that is being used to access the page
  let accessEmail = Session.getActiveUser().getEmail();

  let accessGranted = false; // Will be determined
  let name = null;
  let memberCellID = null;

  // Check to see if the current email is allowed
  allowedEmails.forEach(function(item, i) {
    if(item.toString().toLowerCase() == accessEmail.toString().toLowerCase()) {
      name = memberSheet.getRange(i + 2, 2, 1, 1).getValue();
      memberCellID = i + 2;
      accessGranted = true; // If the current email is allowed set access granted to true
    }
  });

  // Serve different pages depending on if the access is granted or not.
  if(accessGranted) {
    console.log("Access Granted");

    // Save last login attempt
    memberSheet.getRange(memberCellID, 3, 1, 1).setValue(new Date().toString());

    let jsonPartsData = loadJsonPartsData();

    let pageContext = HtmlService.createTemplateFromFile("Page");

    pageContext.username = name;
    pageContext.partsData = jsonPartsData;

    return pageContext.evaluate();
  } else {
    console.log("Access Denied")
    return HtmlService.createHtmlOutputFromFile("AccessDenied");
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}