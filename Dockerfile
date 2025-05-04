FROM ubuntu:24.04

# Evita i prompt interattivi
ENV DEBIAN_FRONTEND=noninteractive

# Installa dipendenze necessarie per Flutter e Android SDK
RUN apt-get update && apt-get install -y \
  curl \
  git \
  unzip \
  xz-utils \
  zip \
  libglu1-mesa \
  openjdk-17-jdk \
  android-tools-adb \
  bash \
  && apt-get clean

# Installa Flutter (clone leggero)
RUN git clone --depth 1 https://github.com/flutter/flutter.git /flutter -b stable
ENV PATH="/flutter/bin:/flutter/bin/cache/dart-sdk/bin:${PATH}"

# Installa SDK Android (command-line tools)
RUN mkdir -p /usr/lib/android-sdk/cmdline-tools && \
    cd /usr/lib/android-sdk/cmdline-tools && \
    curl -o sdk.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
    unzip sdk.zip -d temp && \
    mv temp/cmdline-tools /usr/lib/android-sdk/cmdline-tools/latest && \
    rm sdk.zip

# Variabili di ambiente per Android SDK
ENV ANDROID_SDK_ROOT=/usr/lib/android-sdk
ENV PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools

# Accetta le licenze e installa i componenti minimi per compilare un'app
RUN yes | sdkmanager --sdk_root=${ANDROID_SDK_ROOT} --licenses
RUN sdkmanager --sdk_root=${ANDROID_SDK_ROOT} \
    "platform-tools" \
    "platforms;android-33" \
    "build-tools;33.0.2" \
    "ndk;26.3.11579264"

# Pre-carica il setup di Flutter
RUN flutter doctor

# Directory di lavoro
WORKDIR /app

CMD ["bash"]

