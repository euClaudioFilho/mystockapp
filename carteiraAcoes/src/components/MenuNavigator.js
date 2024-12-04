import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import TelaLogin from '../views/TelaLogin';
import TelaCadastro from '../views/TelaCadastro';
import TelaHome from '../views/TelaHome';
import TelaDepositosRetiradas from '../views/TelaDepositosRetiradas';
import TelaRentabilidade from '../views/TelaRentabilidade';
import TelaGestaoAtivos from '../views/TelaGestaoAtivos';
import TelaCompraAtivos from '../views/TelaCompraAtivos';
import TelaRegistroDividendos from '../views/TelaRegistroDividendos';
import TelaHistorico from '../views/TelaHistorico';
import TelaDashboard from '../views/TelaDashboard';

const Stack = createStackNavigator()

export default MenuNavigator = ()=>{

    return(
        <NavigationContainer>
        <Stack.Navigator initialRouteName="TelaLogin">
          <Stack.Screen name="TelaLogin" component={TelaLogin} options={{ title: 'Login' }} />
          <Stack.Screen name="TelaCadastro" component={TelaCadastro} options={{ title: 'Cadastro' }} />
          <Stack.Screen name="TelaHome" component={TelaHome} options={{ title: 'Home' }} />
          <Stack.Screen name="TelaRegistroDividendos" component={TelaRegistroDividendos} options={{ title: 'Registro de Dividendos' }} />
          <Stack.Screen name="TelaDepositosRetiradas" component={TelaDepositosRetiradas} options={{ title: 'Depósitos e Retiradas' }} />
          <Stack.Screen name="TelaRentabilidade" component={TelaRentabilidade} options={{ title: 'Rentabilidade' }} />
          <Stack.Screen name="TelaGestaoAtivos" component={TelaGestaoAtivos} options={{ title: 'Gestão de Ativos' }} />
          <Stack.Screen name="TelaCompraAtivos" component={TelaCompraAtivos} options={{ title: 'Compra de Ativos ' }} />
          <Stack.Screen name="TelaHistorico" component={TelaHistorico} options={{ title: 'Historico' }} />
          <Stack.Screen name="TelaDashboard" component={TelaDashboard} options={{ title: 'Dashboard' }} />
        </Stack.Navigator>
      </NavigationContainer>
    )

}