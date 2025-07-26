import {AdminMenu} from "@models/admin-menu.model";

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

export const getFilteredAdminMenuPharmaItems = (key: string) => {
  return [
    new AdminMenu(10, 'ADMIN_NAV.DASHBOARD', '/admin', null, 'dashboard', null, false, 0),
    new AdminMenu(20, 'Catalogue', null, null, 'inventory_2', null, true, 0),
    new AdminMenu(21, 'Categories', '/admin/products/categories', null, 'category', null, false, 20),
    new AdminMenu(22, 'ADMIN_NAV.PRODUCT_LIST', '/admin/products/product-list', null, 'view_list', null, false, 20),
    new AdminMenu(23, 'ADMIN_NAV.PRODUCT_DETAIL', '/admin/products/product-detail', null, 'visibility', null, false, 20),
    new AdminMenu(24, 'ADMIN_NAV.ADD_PRODUCT', '/admin/products/add-product', null, 'add', null, false, 20),
    new AdminMenu(25, 'Formes', '/admin/products/formes', null, 'shape_line', null, false, 20),
    new AdminMenu(26, 'Fabriquants', '/admin/products/fabriquants', null, 'factory', null, false, 20),
    new AdminMenu(27, 'Rayons', '/admin/products/rayons', null, 'storefront', null, false, 20),
    new AdminMenu(28, 'magasins', '/admin/products/magasins', null, 'store', null, false, 20),
    new AdminMenu(29, 'Rapport caisse', '/admin/products/rapport_caisse', null, 'receipt_long', null, false, 20),
    new AdminMenu(30, 'Produit detail list', '/admin/products/product_detail_list', null, 'list_alt', null, false, 20),

    // Vente menu and submenus
    new AdminMenu(300, 'ventes', null, null, 'shopping_cart', null, true, 0),
    new AdminMenu(301, 'liste ventes', '/admin/ventes/list', null, 'list', null, false, 300),
    ...(key === 'differe' ? [new AdminMenu(302, 'encaisser vente', '/admin/ventes/encaisser_vente', null, 'payment', null, false, 300)] : []),
    new AdminMenu(303, 'ajouter vente', '/admin/ventes/ajouter_vente', null, 'add_shopping_cart', null, false, 300),
    new AdminMenu(304, 'retour produit', '/admin/ventes/retour_produit', null, 'undo', null, false, 300),

    new AdminMenu(400, 'commande', '/admin/commandes/lister_ajouter_commande', null, 'assignment', null, false, 0),

    // Stock menu and submenus
    new AdminMenu(500, 'Stock', null, null, 'inventory', null, true, 0),
    new AdminMenu(501, 'Entrées', '/admin/stock/entrees', null, 'input', null, false, 500),
    new AdminMenu(502, 'Sorties', '/admin/stock/sorties', null, 'output', null, false, 500),
    new AdminMenu(503, 'Inventaire', '/admin/stock/inventaire', null, 'list_alt', null, false, 500),

    new AdminMenu(600, 'Parametre', null, null, 'settings', null, true, 0),
    new AdminMenu(601, 'General', '/admin/setting/setting', null, 'tune', null, false, 600),
    new AdminMenu(602, 'Employe', '/admin/setting/employe', null, 'people', null, false, 600),
    new AdminMenu(603, 'Client', '/admin/setting/client', null, 'person', null, false, 600),
  ];
};
