import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

type LoginScreenProps = {
  navigation: any;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { signIn, logAuthEvent } = useAuth();

  const handleLogin = async () => {
    // Validações básicas
    if (!email) {
      setErrorMsg('Digite seu email');
      return;
    }
    
    if (!password) {
      setErrorMsg('Digite sua senha');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      // Log de tentativa de login
      logAuthEvent('login_attempt', { email });

      const { error } = await signIn(email, password);
      
      if (error) {
        // Formatar mensagem de erro para ser amigável
        let message = 'Não foi possível fazer login';
        
        if (error.message?.includes('credentials')) {
          message = 'Email ou senha incorretos';
        } else if (error.message?.includes('network')) {
          message = 'Erro de conexão. Verifique sua internet.';
        }
        
        setErrorMsg(message);
      }
    } catch (error: any) {
      setErrorMsg('Erro ao tentar login: ' + (error.message || 'Desconhecido'));
      logAuthEvent('login_exception', { email, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Registrar evento
    logAuthEvent('forgot_password_tap', {});
    
    // Mostrar modal nativo para recuperação de senha
    Alert.alert(
      "Recuperação de senha",
      "Você será redirecionado para o site Locate-Family-Connect para redefinir sua senha.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Continuar", 
          onPress: () => {
            // Implementar abertura do browser para reset
            logAuthEvent('forgot_password_continue', {});
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Locate-Family-Connect</Text>
        <Text style={styles.subtitle}>Compartilhamento seguro de localização</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="email-input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCorrect={false}
              testID="password-input"
            />
          </View>

          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
            testID="forgot-password-button"
          >
            <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading ? styles.buttonDisabled : null]}
            onPress={handleLogin}
            disabled={loading}
            testID="login-button"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Versão 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    marginTop: 8,
    marginBottom: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#4F46E5',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  version: {
    color: '#94A3B8',
    fontSize: 12,
  }
});
