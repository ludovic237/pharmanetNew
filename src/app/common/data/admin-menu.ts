import { AdminMenu } from "@models/admin-menu.model"; 

export const adminMenuItems = [ 
    new AdminMenu (10, 'ADMIN_NAV.DASHBOARD', '/admin', null, 'dashboard', null, false, 0),
    new AdminMenu (20, 'ADMIN_NAV.PRODUCTS', null, null, 'grid_on', null, true, 0),  
    new AdminMenu (21, 'ADMIN_NAV.CATEGORIES', '/admin/products/categories', null, 'category', null, false, 20), 
    new AdminMenu (22, 'ADMIN_NAV.PRODUCT_LIST', '/admin/products/product-list', null, 'list', null, false, 20), 
    new AdminMenu (23, 'ADMIN_NAV.PRODUCT_DETAIL', '/admin/products/product-detail', null, 'remove_red_eye', null, false, 20),  
    new AdminMenu (24, 'ADMIN_NAV.ADD_PRODUCT', '/admin/products/add-product', null, 'add_circle_outline', null, false, 20), 
    new AdminMenu (30, 'ADMIN_NAV.SALES', null, null, 'monetization_on', null, true, 0), 
    new AdminMenu (31, 'ADMIN_NAV.ORDERS', '/admin/sales/orders', null, 'list_alt', null, false, 30), 
    new AdminMenu (32, 'ADMIN_NAV.TRANSACTIONS', '/admin/sales/transactions', null, 'local_atm', null, false, 30),  
    new AdminMenu (40, 'ADMIN_NAV.USERS', '/admin/users', null, 'group_add', null, false, 0),   
    new AdminMenu (50, 'ADMIN_NAV.CUSTOMERS', '/admin/customers', null, 'supervisor_account', null, false, 0),  
    new AdminMenu (60, 'ADMIN_NAV.COUPONS', '/admin/coupons', null, 'card_giftcard', null, false, 0),  
    new AdminMenu (70, 'ADMIN_NAV.WITHDRAWAL', '/admin/withdrawal', null, 'credit_card', null, false, 0), 
    new AdminMenu (80, 'ADMIN_NAV.ANALYTICS', '/admin/analytics', null, 'multiline_chart', null, false, 0), 
    new AdminMenu (90, 'ADMIN_NAV.REFUND', '/admin/refund', null, 'restore', null, false, 0),  
    new AdminMenu (100, 'ADMIN_NAV.FOLLOWERS', '/admin/followers', null, 'follow_the_signs', null, false, 0), 
    new AdminMenu (110, 'ADMIN_NAV.SUPPORT', '/admin/support', null, 'support', null, false, 0), 
    new AdminMenu (120, 'ADMIN_NAV.REVIEWS', '/admin/reviews', null, 'insert_comment', null, false, 0), 
    new AdminMenu (140, 'Level 1', null, null, 'more_horiz', null, true, 0),
    new AdminMenu (141, 'Level 2', null, null, 'folder_open', null, true, 140),
    new AdminMenu (142, 'Level 3', null, null, 'folder_open', null, true, 141),
    new AdminMenu (143, 'Level 4', null, null, 'folder_open', null, true, 142),
    new AdminMenu (144, 'Level 5', null, '/', 'link', null, false, 143),
    new AdminMenu (200, 'ADMIN_NAV.EXTERNAL_LINK', null, 'http://themeseason.com', 'open_in_new', '_blank', false, 0)
]