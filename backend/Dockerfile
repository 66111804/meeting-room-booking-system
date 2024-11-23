FROM oven/bun
RUN apt-get update && apt-get install -y iputils-ping
WORKDIR /usr/src/app
# Copy the package.json, bun.lockb, and other source code files
COPY package*.json bun.lockb ./
COPY . .
# Set the environment to production
ENV NODE_ENV=production
# Install dependencies using bun
RUN bun install
# Ensure bunx is available globally
ENV PATH="/root/.bun/bin:$PATH"
# Generate Prisma Client
RUN bunx prisma generate
# Copy the setup.sh script into the container
COPY setup.sh /usr/src/app/setup.sh
RUN chmod +x /usr/src/app/setup.sh
# Expose the port
EXPOSE 3000
# Run the application
CMD ["bun", "run", "start"]