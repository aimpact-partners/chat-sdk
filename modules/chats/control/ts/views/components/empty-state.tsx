import React, { ComponentType, ReactNode } from 'react';

interface EmptyStateProps {
	empty?: ReactNode | ComponentType<any>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ empty }) => {
	if (!empty) return <>No hay contenido</>;
	if (React.isValidElement(empty)) return <>{empty}</>;
	if (typeof empty === 'function') {
		const Comp = empty as ComponentType<any>;
		return <Comp />;
	}
	return <>{empty}</>;
};
