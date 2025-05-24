import { Injectable } from '@angular/core';
import { 
  signIn,
  signUp, 
  getCurrentUser,
  signOut,
  fetchAuthSession,
  updatePassword,
  resetPassword,
  confirmResetPassword
} from 'aws-amplify/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {  }

  async login(username: string, password: string): Promise<any> {
    try {
      return await signIn({ 
        username, 
        password,
        options: {
          authFlowType: 'USER_PASSWORD_AUTH'
        }
      });
    } catch (error: any) {
      // Cognito a veces usa __type en lugar de name
      const errorType = error.__type || error.name;
      const cognitoError = new Error(error.message);
      cognitoError.name = errorType;
      throw cognitoError;
    }
  }

  async signUp(username: string, password: string): Promise<any> {
    return signUp({
      username,
      password
    });
  }

  async getCurrentUser() {
    return getCurrentUser();
  }

  async logout() {
    return signOut();
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  async isAdmin(): Promise<boolean> {
    try {
      const { tokens } = await fetchAuthSession();
      const groups = tokens?.accessToken?.payload['cognito:groups'] || [];
      
      // Verifica si groups es un array antes de usar includes
      if (Array.isArray(groups)) {
        return groups.includes('Admin');
      }
      return false;
    } catch {
      return false;
    }
  }
  async changePassword( oldPassword: string, newPassword: string ): Promise<void> {
    try {   
      await updatePassword({ oldPassword, newPassword });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }


  async forgotPassword(username: string): Promise<void> {
    try {
      await resetPassword({ username });
    } catch (error: any) {
      console.error('Error en forgotPassword:', error);
      throw new Error(this.getFriendlyErrorMessage(error));
    }
  }
  
  async confirmPasswordReset(
    username: string,
    confirmationCode: string,
    newPassword: string
  ): Promise<void> {
    try {
      await confirmResetPassword({ 
        username, 
        confirmationCode, 
        newPassword 
      });
    } catch (error: any) {
      console.error('Error en confirmPasswordReset:', error);
      throw new Error(this.getFriendlyErrorMessage(error));
    }
  }
  
  private getFriendlyErrorMessage(error: any): string {
    const errorType = error.__type || error.name;
    
    switch (errorType) {
      case 'UserNotFoundException':
        return 'El usuario no existe en el sistema';
      case 'InvalidParameterException':
        return 'El código de verificación es inválido o ha expirado';
      case 'CodeMismatchException':
        return 'El código de verificación no coincide';
      case 'LimitExceededException':
        return 'Has excedido el número máximo de intentos. Por favor intenta más tarde';
      case 'InvalidPasswordException':
        return 'La contraseña no cumple con los requisitos de complejidad';
      default:
        return error.message || 'Ocurrió un error inesperado';
    }
  }

  async getCurrentUserEmail(): Promise<string> {
    // Primero intenta obtener del localStorage de Cognito
    const cognitoKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('CognitoIdentityServiceProvider') && 
      key.includes('LastAuthUser')
    );

    if (cognitoKeys.length > 0) {
      const lastAuthKey = cognitoKeys[0];
      const username = localStorage.getItem(lastAuthKey);
      if (username) {
        return username;
      }
    }

    // Si no está en Cognito keys, intenta con el método actual
    try {
      const user = await this.getCurrentUser();
      if (user.username) {
        return user.username;
      }
      throw new Error('No se pudo obtener el email del usuario');
    } catch (error) {
      console.error('Error obteniendo email:', error);
      throw new Error('No se pudo obtener el email del usuario');
    }
  }
}