"use client";
import React from "react";
import { Stack } from "styled-system/jsx";
import { LoginCard } from "~/features/routes/auth/login/LoginCard";
import { useLogin } from "~/features/routes/auth/login/useLogin";

export const ClientLoginPage: React.FC = () => {
    const { onLogin } = useLogin();
    return (
        <Stack justifyContent={"center"} alignItems={"center"} height={"100vh"}>
            <LoginCard onLogin={onLogin} />
        </Stack>
    )
};