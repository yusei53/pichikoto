"use client";
import React from "react";
import { Box } from "styled-system/jsx";
import { LoginCard } from "~/features/routes/auth/login/LoginCard";
import { useLogin } from "~/features/routes/auth/login/useLogin";

export const ClientLoginPage: React.FC = () => {
	const { onLogin } = useLogin();
	return (
		<Box
			minH="100vh"
			bg="#FAFBFC"
			display="flex"
			alignItems="center"
			justifyContent="center"
			px="6"
		>
			<LoginCard onLogin={onLogin} />
		</Box>
	);
};
