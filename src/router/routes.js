const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'index',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'scan-file',
        name: 'scan-file',
        component: () => import('pages/FileScanPage.vue'),
      },
      {
        path: 'scan-url',
        name: 'scan-url',
        component: () => import('pages/URLScanPage.vue'),
      },
      {
        path: 'result-file/:id',
        name: 'result-file',
        component: () => import('pages/FileScanResultPage.vue'),
      },
      {
        path: 'result-url/:id',
        name: 'result-url',
        component: () => import('pages/URLScanResultPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
