import { ROUTES_PATH } from '../constants/routes.js';
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon));
    });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    console.log("Navigating to NewBill page");
    this.onNavigate(ROUTES_PATH['NewBill']);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5);
    console.log("Opening modal with image URL:", billUrl);
    $('#modaleFile').find(".modal-body").html(
      `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
    );
    $('#modaleFile').modal('show');
  };

  getBills = () => {
    console.log("Fetching bills...");
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then(snapshot => {
          console.log("Received bills data:", snapshot);
          const bills = snapshot.map(doc => {
            console.log("Processing bill with date:", doc.date);
            try {
              const formattedDate = formatDate(doc.date);
              console.log("Formatted date:", formattedDate);
              return {
                ...doc,
                date: formattedDate,
                status: formatStatus(doc.status),
              };
            } catch (e) {
              console.error("Error formatting date:", e, "for bill:", doc);
              return {
                ...doc,
                date: doc.date, // Original date if formatting fails
                status: formatStatus(doc.status),
              };
            }
          });
          console.log("Total bills processed:", bills.length);
          return bills;
        })
        .catch(error => {
          console.error("Error fetching bills:", error);
        });
    } else {
      console.error("Store is undefined");
    }
  };
}
