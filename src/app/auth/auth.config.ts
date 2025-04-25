import { PassedInitialConfig } from 'angular-auth-oidc-client';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_iRAHhDiIV',
    redirectUrl: 'http://localhost:4200/login',
    clientId: '4l266lkv7t1pvsd9fochnljcdq',
    scope: 'email openid profile aws.cognito.signin.user.admin',
    responseType: 'code',
    customParamsAuthRequest: {
      claims: JSON.stringify({
        id_token: {
          'cognito:groups': null, // Solicita explícitamente los grupos
        },
      }),
    },   
    silentRenew: true,
    useRefreshToken: true,
  },
};
