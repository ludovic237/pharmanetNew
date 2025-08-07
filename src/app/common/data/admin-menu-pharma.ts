
/*
export const adminMenuPharmaItems = [
    new AdminMenu(10, 'ADMIN_NAV.DASHBOARD', '/admin', null, 'dashboard', null, false, 0),
    new AdminMenu(20, 'Catalogue', null, null, 'grid_on', null, true, 0),
    new AdminMenu(21, 'Categories', '/admin/products/categories', null, 'category', null, false, 20),
    new AdminMenu(22, 'ADMIN_NAV.PRODUCT_LIST', '/admin/products/product-list', null, 'list', null, false, 20),
    new AdminMenu(23, 'ADMIN_NAV.PRODUCT_DETAIL', '/admin/products/product-detail', null, 'remove_red_eye', null, false, 20),
    new AdminMenu(24, 'ADMIN_NAV.ADD_PRODUCT', '/admin/products/add-product', null, 'add_circle_outline', null, false, 20),
    new AdminMenu(25, 'Formes', '/admin/products/formes', null, 'category', null, false, 20),
    new AdminMenu(26, 'Fabriquants', '/admin/products/fabriquants', null, 'factory', null, false, 20),
    new AdminMenu(27, 'Rayons', '/admin/products/rayons', null, 'store', null, false, 20),
    new AdminMenu(28, 'magasins', '/admin/products/magasins', null, 'store_mall_directory', null, false, 20),
    new AdminMenu(29, 'Rapport caisse', '/admin/products/rapport-caisse', null, 'store_mall_directory', null, false, 20),
    new AdminMenu(30, 'Produit detail list', '/admin/products/product-detail-list', null, 'store_mall_directory', null, false, 20),

  // Vente menu and submenus
  new AdminMenu(300, 'ventes', null, null, 'shopping_cart', null, true, 0),
  new AdminMenu(301, 'liste ventes', '/admin/ventes/list', null, 'list', null, false, 300),
  new AdminMenu(302, 'encaisser vente', '/admin/ventes/encaisser-vente', null, 'add_circle_outline', null, false, 300),
  new AdminMenu(303, 'ajouter vente', '/admin/ventes/ajouter-vente', null, 'bar_chart', null, false, 300),
  new AdminMenu(304, 'retour produit', '/admin/ventes/retour-produit', null, 'bar_chart', null, false, 300),

  new AdminMenu(400, 'commande', '/admin/commandes/lister-ajouter-commande', null, 'assignment', null, false, 0),

  // Stock menu and submenus
  new AdminMenu(500, 'Stock', null, null, 'inventory', null, true, 0),
  new AdminMenu(501, 'Entrées', '/admin/stock/entrees', null, 'input', null, false, 500),
  new AdminMenu(502, 'Sorties', '/admin/stock/sorties', null, 'output', null, false, 500),
  new AdminMenu(503, 'Inventaire', '/admin/stock/inventaire', null, 'list_alt', null, false, 500),
];
*/

import {AdminMenuPharma} from "@models/admin-menu-pharma.model";

export const getFilteredAdminMenuPharmaItems = (key: string) => {
  return [
    new AdminMenuPharma(10, 'ADMIN_NAV.DASHBOARD', '/admin', null, 'dashboard', null, false, 0,['Administrateur','Caissier','Vendeur']),

    new AdminMenuPharma(20, 'Catalogue', null, null, 'inventory_2', null, true, 0,['Administrateur','Caissier','Vendeur']),
    new AdminMenuPharma(21, 'Categories', '/admin/products/categories', null, 'category', null, false, 20,['Administrateur','Caissier','Vendeur']),
    new AdminMenuPharma(22, 'ADMIN_NAV.PRODUCT_LIST', '/admin/products/product_list', null, 'view_list', null, false, 20,['Administrateur','Caissier','Vendeur']),
    new AdminMenuPharma(23, 'ADMIN_NAV.PRODUCT_DETAIL', '/admin/products/product_detail', null, 'visibility', null, false, 20,['Administrateur','Caissier','Vendeur']),
    new AdminMenuPharma(24, 'ADMIN_NAV.ADD_PRODUCT', '/admin/products/add_product', null, 'add', null, false, 20,['Administrateur','Caissier','Vendeur']),
    new AdminMenuPharma(25, 'Formes', '/admin/products/formes', null, 'shape_line', null, false, 20,['Administrateur','Caissier','Vendeur']),
    new AdminMenuPharma(26, 'Fabriquants', '/admin/products/fabriquants', null, 'factory', null, false, 20,['Administrateur','Caissier','Vendeur']),
    new AdminMenuPharma(27, 'Rayons', '/admin/products/rayons', null, 'storefront', null, false, 20,['Administrateur','Caissier','Vendeur']),
    new AdminMenuPharma(28, 'magasins', '/admin/products/magasins', null, 'store', null, false, 20,['Administrateur','Caissier','Vendeur']),
    new AdminMenuPharma(30, 'Produit detail list', '/admin/products/product_detail_list', null, 'list_alt', null, false, 20,['Administrateur','Caissier','Vendeur']),

    // Vente menu and submenus
    new AdminMenuPharma(300, 'ventes', null, null, 'shopping_cart', null, true, 0,['Administrateur','Caissier','Vendeur']),
    new AdminMenuPharma(301, 'liste ventes', '/admin/ventes/list', null, 'list', null, false, 300,['Administrateur','Caissier','Vendeur']),
    ...(key === 'differe' ?
      [
        new AdminMenuPharma(302, 'encaisser vente', '/admin/ventes/encaisser_vente', null, 'payment', null, false, 300,['Administrateur','Caissier'])] : []),
    new AdminMenuPharma(303, 'ajouter vente', '/admin/ventes/ajouter_vente', null, 'add_shopping_cart', null, false, 300,['Administrateur','Caissier','Vendeur']),
    new AdminMenuPharma(304, 'retour produit', '/admin/ventes/retour_produit', null, 'undo', null, false, 300,['Administrateur','Caissier','Vendeur']),

    new AdminMenuPharma(400, 'commande', '/admin/commandes/lister_ajouter_commande', null, 'assignment', null, false, 0,['Administrateur']),

    // Stock menu and submenus
    new AdminMenuPharma(500, 'Stock', null, null, 'inventory', null, true, 0,['Administrateur','Caissier','Vendeur']),
    new AdminMenuPharma(501, 'Entrées', '/admin/stock/entrees', null, 'input', null, false, 500,['Administrateur','Caissier','Vendeur']),
    new AdminMenuPharma(502, 'Sorties', '/admin/stock/sorties', null, 'output', null, false, 500,['Administrateur','Caissier','Vendeur']),
    new AdminMenuPharma(503, 'Inventaire', '/admin/stock/inventaire', null, 'list_alt', null, false, 500,['Administrateur','Caissier','Vendeur']),

    new AdminMenuPharma(600, 'Rapport caisse', '/admin/products/rapport_caisse', null, 'receipt_long', null, false, 0,['Administrateur','Caissier','Vendeur']),

    new AdminMenuPharma(700, 'Parametre', null, null, 'settings', null, true, 0,['Administrateur','Caissier']),
    new AdminMenuPharma(701, 'General', '/admin/setting/setting', null, 'tune', null, false, 700,['Administrateur','Caissier']),
    new AdminMenuPharma(702, 'Employe', '/admin/setting/employe', null, 'people', null, false, 700,['Administrateur','Caissier']),
    new AdminMenuPharma(703, 'Client', '/admin/setting/client', null, 'person', null, false, 700,['Administrateur','Caissier']),
    new AdminMenuPharma(704, 'Depense', '/admin/setting/depense', null, 'person', null, false, 700,['Administrateur','Caissier']),
    new AdminMenuPharma(705, 'Activite', '/admin/setting/activite', null, 'person', null, false, 700,['Administrateur','Caissier']),
  ];
};
