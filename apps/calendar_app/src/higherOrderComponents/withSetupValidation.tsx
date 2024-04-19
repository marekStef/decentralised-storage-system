import React, { ComponentType, useEffect } from 'react';
import { useRouter } from 'next/router';
import persistenceManager from '@/data/PersistenceManager';

interface WithSetupValidationOptions {
  redirectToIfNotSetup?: string;
  redirectToIfSetup?: string;
}
function withSetupValidation<P extends React.JSX.IntrinsicAttributes>(
  WrappedComponent: ComponentType<P>,
  { redirectToIfNotSetup = '/Setup', redirectToIfSetup = '/WeekPage' }: WithSetupValidationOptions = {}
) {

  const WithValidation = (props: P) => {
    const Router = useRouter();

    const isCalendarSetupSuccessfully = (): boolean => {
      persistenceManager.loadDataFromLocalStorage();
      return persistenceManager.areAllValuesSet();
    };

    useEffect(() => {
      if (typeof window === 'undefined') return;

      const setupComplete = isCalendarSetupSuccessfully();

      if (!setupComplete) {
        Router.replace(redirectToIfNotSetup);
        return;
      }

      if (setupComplete) {
        Router.replace(redirectToIfSetup);
        return;
      }
    }, []);

    return <WrappedComponent {...props} />;
  };

  WithValidation.displayName = `WithSetupValidation(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithValidation;
};


export default withSetupValidation;
