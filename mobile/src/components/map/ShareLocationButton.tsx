import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Alert
} from 'react-native';

// Seguindo princípio de componentes pequenos (max 50 linhas)
// e com apenas 2 propriedades principais (onPress e isLoading)
type ShareLocationButtonProps = {
  onPress: () => Promise<any>;
  isLoading?: boolean;
  disabled?: boolean;
};

export default function ShareLocationButton({
  onPress,
  isLoading = false,
  disabled = false
}: ShareLocationButtonProps) {
  
  // Encapsulando a lógica de confirmação antes do compartilhamento
  const handleSharePress = async () => {
    // Confirmar ação sensível antes de executar
    Alert.alert(
      "Compartilhar Localização",
      "Sua localização atual será compartilhada com seus responsáveis. Deseja continuar?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Compartilhar",
          onPress
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled || isLoading ? styles.buttonDisabled : null
      ]}
      onPress={handleSharePress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={styles.buttonText}>Compartilhar Localização</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
