import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTest.js'
import Logout from "./Logout.js"

export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {
      let selectCondition

      // in jest environment
      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status)
      }
      /* istanbul ignore next */
      else {
        // in prod environment
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          (bill.status === status) &&
          ![...USERS_TEST, userEmail].includes(bill.email)
      }

      return selectCondition
    }) : []
}

export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ?
  firstAndLastNames.split('.')[1] : firstAndLastNames

  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}

export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending"
    case 2:
      return "accepted"
    case 3:
      return "refused"
  }
}

export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    // Assignation des propriétés de l'instance avec les paramètres du constructeur
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    
    // Initialisation d'un objet pour garder une trace des écouteurs d'événements
    this.initializedListeners = new Set(); // Utilisation d'un Set

    // Attachement des écouteurs d'événements pour chaque catégorie de notes de frais.
    // Les fonctions fléchées assurent que le contexte de 'this' reste lié à l'instance de la classe.
    this.initializeShowTicketsListener('#arrow-icon1', bills, 1);
    this.initializeShowTicketsListener('#arrow-icon2', bills, 2);
    this.initializeShowTicketsListener('#arrow-icon3', bills, 3);
    
    // Instanciation du système de déconnexion
    new Logout({ localStorage, onNavigate });
  }

  // Cette nouvelle méthode initialise les écouteurs d'événements pour les flèches de catégories.
  // Elle s'assure de n'ajouter l'écouteur qu'une seule fois pour éviter les doublons.
  initializeShowTicketsListener(selector, bills, index) {
    $(selector).off('click').click((e) => this.handleShowTickets(e, bills, index));
}

  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url")
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8)
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`)
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show')
  }

  handleEditTicket(e, bill, bills) {
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id
    if (this.counter % 2 === 0) {
      bills.forEach(b => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
      })
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })
      $('.dashboard-right-container div').html(DashboardFormUI(bill))
      $('.vertical-navbar').css({ height: '150vh' })
      this.counter ++
    } else {
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })

      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `)
      $('.vertical-navbar').css({ height: '120vh' })
      this.counter ++
    }
    $('#icon-eye-d').click(this.handleClickIconEye)
    $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill))
    $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill))
  }

  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleShowTickets(e, bills, index) {
    const status = getStatus(index);
    const billsToDisplay = filteredBills(bills, status);
  
    // Vérifier si les billets sont déjà affichés
    const isTicketsDisplayed = $(`#status-bills-container${index}`).children().length > 0;
  
    // Si les billets sont déjà affichés, les masquer
    if (isTicketsDisplayed) {
      $(`#arrow-icon${index}`).css({ transform: 'rotate(0deg)' });
      $(`#status-bills-container${index}`).html('');
      this.counter++;
      return [];
    }
  
    // Sinon, afficher les billets
    $(`#arrow-icon${index}`).css({ transform: 'rotate(90deg)' });
    $(`#status-bills-container${index}`).html(cards(billsToDisplay));
    
    // Attacher les écouteurs d'événements aux billets nouvellement affichés
    billsToDisplay.forEach(bill => {
      const billElementId = `#open-bill${bill.id}`;
      $(billElementId).off('click').on('click', (e) => this.handleEditTicket(e, bill, bills));
    });
  
    this.counter++;
    return billsToDisplay;
  }
  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
        .map(doc => ({
          id: doc.id,
          ...doc,
          date: doc.date,
          status: doc.status
        }))
        return bills
      })
      .catch(error => {
        throw error;
      })
    }
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
    return this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: bill.id})
      .then(bill => bill)
      .catch(console.log)
    }
  }
}
