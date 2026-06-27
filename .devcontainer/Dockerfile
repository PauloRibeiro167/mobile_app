FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
  git \
  curl \
  ca-certificates \
  unzip \
  bash \
  dialog \
  usbutils \
  udev \
  wget \
  gnupg \
  locales \
  && rm -rf /var/lib/apt/lists/*

# Instala Java 21 via Adoptium
RUN wget -qO- https://packages.adoptium.net/artifactory/api/gpg/key/public | gpg --dearmor -o /usr/share/keyrings/adoptium.gpg && \
  echo "deb [signed-by=/usr/share/keyrings/adoptium.gpg] https://packages.adoptium.net/artifactory/deb bookworm main" \
  > /etc/apt/sources.list.d/adoptium.list && \
  apt-get update && \
  apt-get install -y --no-install-recommends temurin-21-jdk && \
  rm -rf /var/lib/apt/lists/*

RUN echo "pt_BR.UTF-8 UTF-8" > /etc/locale.gen && locale-gen

ENV LANG=pt_BR.UTF-8 \
  LANGUAGE=pt_BR:pt \
  LC_ALL=pt_BR.UTF-8
ENV JAVA_HOME=/usr/lib/jvm/temurin-21-jdk-amd64
ENV PATH=$PATH:$JAVA_HOME/bin

RUN npm install -g @angular/cli @ionic/cli

# Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

RUN mkdir -p $ANDROID_HOME/cmdline-tools && \
  curl -fsSL -o cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
  unzip cmdline-tools.zip -d $ANDROID_HOME/cmdline-tools && \
  mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest && \
  rm cmdline-tools.zip && \
  yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses && \
  $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# ADB
RUN mkdir -p /root/.android && \
  cat > /root/.android/adb_usb.ini <<'EOF'
0x2a70
0x22b8
EOF

WORKDIR /workspaces

COPY G-ROM/package.json G-ROM/package-lock.json ./
RUN npm install
COPY . .

EXPOSE 8100 8101
CMD ["bin/dev"]